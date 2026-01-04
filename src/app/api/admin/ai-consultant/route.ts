import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with a default value to prevent crash if key is missing during build
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('AI Consultant: Starting request');

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MISSING_KEY') {
            console.error('AI Consultant: GEMINI_API_KEY is not set');
            return NextResponse.json({
                error: 'Sistem hatası: API anahtarı yapılandırılmamış. Lütfen Vercel ayarlarını kontrol edin.'
            }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();
        const year = searchParams.get('year') || new Date().getFullYear().toString();

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

        // 1. Fetch Sales Data
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: 'COMPLETED'
            },
            include: { orderItems: true }
        });

        // 2. Fetch Expense Data
        const expenses = await prisma.expense.findMany({
            where: {
                date: { gte: startDate, lte: endDate }
            }
        });

        // 3. Fetch Waste Data
        const wasteLogs = await prisma.wasteLog.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        // 4. Check for lack of data
        if (orders.length === 0 && expenses.length === 0) {
            return NextResponse.json({
                summary: "Bu ay için henüz yeterli işletme verisi bulunmuyor. Analiz için sipariş kayıtlarına veya gider girişlerine ihtiyacım var.",
                recommendations: [
                    "Sipariş almaya başladığınızda burada analizleri görebileceksiniz.",
                    "Giderlerinizi kaydederek maliyet analizi yapmamı sağlayabilirsiniz.",
                    "Zayiat kayıtlarını tutarak fire oranlarını düşürmeme yardımcı olabilirsiniz."
                ],
                mood: "neutral"
            });
        }

        // 5. Summarize data for AI
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.finalAmount, 0);
        const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        const topProducts = orders.flatMap((o: any) => {
            if (!o.orderItems) return [];
            return o.orderItems;
        }).reduce((acc: any, item: any) => {
            acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
            return acc;
        }, {});

        const sortedProducts = Object.entries(topProducts)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 5);

        const wasteSummary = wasteLogs.reduce((acc: any, w: any) => {
            acc[w.reason || 'Diğer'] = (acc[w.reason || 'Diğer'] || 0) + w.quantity;
            return acc;
        }, {});

        // 6. Prepare Prompt
        // Use gemini-2.0-flash as it is confirmed available for this key
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: 'v1' });

        const prompt = `
            Sen Nocca Coffee'nin profesyonel AI iş danışmanısın. Aşağıdaki aylık işletme verilerini bir cafe sahibi gözüyle analiz et.
            
            VERİLER (${month}/${year}):
            - Toplam Ciro: ${totalRevenue.toLocaleString('tr-TR')} TL
            - Toplam Gider: ${totalExpenses.toLocaleString('tr-TR')} TL
            - En Çok Satan 5 Ürün: ${JSON.stringify(sortedProducts)}
            - Gider Kategorileri: ${JSON.stringify(expenses.reduce((acc: any, e: any) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {}))}
            - Zayiat/Fire Sebepleri: ${JSON.stringify(wasteSummary)}
            - Tamamlanan Sipariş Sayısı: ${orders.length}

            GÖREV:
            1. İşletmenin bu ayki performansını 2 cümlede özetle.
            2. Maliyetleri düşürmek veya satışları artırmak için 3 tane somut, uygulanabilir ve profesyonel tavsiye ver.
            3. Analizini samimi ama kurumsal bir dille yap.
            
            Yanıtını SADECE JSON formatında şu yapıda ver (kod bloku kullanma, başka hiçbir metin ekleme):
            {
                "summary": "...",
                "recommendations": ["...", "...", "..."],
                "mood": "positive | neutral | warning"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        // Improved Regex-based JSON extraction
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI geçerli bir JSON formatı döndürmedi.');
        }

        const aiAnalysis = JSON.parse(jsonMatch[0]);
        return NextResponse.json(aiAnalysis);

    } catch (error: any) {
        console.error('AI Consultant API Critical Error:', error);

        // Return a 200 status with an error field to avoid browser 500 noise and show a helpful message
        return NextResponse.json({
            error: 'AI servisi şu an meşgul veya yapılandırma hatası var.',
            details: error.message,
            mood: 'neutral',
            summary: "Şu an analiz yapılamıyor: " + error.message,
            recommendations: ["Lütfen bir süre sonra tekrar deneyin.", "API ayarlarını kontrol edin."]
        }, { status: 200 }); // Changed to 200 to help frontend handle it gracefully
    }
}

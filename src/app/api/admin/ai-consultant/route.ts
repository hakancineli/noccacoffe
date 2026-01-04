import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with a default value to prevent crash if key is missing during build
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    console.log('AI Consultant: Request received');
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.error('AI Consultant: Missing API Key');
            return NextResponse.json({ error: 'Gemini API Key is not configured in environment variables' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();
        const year = searchParams.get('year') || new Date().getFullYear().toString();

        console.log(`AI Consultant: Analyzing for ${month}/${year}`);

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

        // 1. Fetch Sales Data
        console.log('AI Consultant: Fetching orders...');
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: 'COMPLETED'
            },
            include: { orderItems: true }
        });

        // 2. Fetch Expense Data
        console.log('AI Consultant: Fetching expenses...');
        const expenses = await prisma.expense.findMany({
            where: {
                date: { gte: startDate, lte: endDate }
            }
        });

        // 3. Fetch Waste Data
        console.log('AI Consultant: Fetching waste logs...');
        const wasteLogs = await prisma.wasteLog.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        // 4. Summarize data for AI
        console.log('AI Consultant: Summarizing data...');
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.finalAmount, 0);
        const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        const topProducts = orders.flatMap((o: any) => o.orderItems).reduce((acc: any, item: any) => {
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

        // 5. Prepare Prompt
        console.log('AI Consultant: Calling Gemini API...');
        // Try gemini-1.5-flash with default settings first
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Sen Nocca Coffee'nin profesyonel AI iş danışmanısın. Aşağıdaki aylık işletme verilerini bir cafe sahibi gözüyle analiz et.
            
            VERİLER (${month}/${year}):
            - Toplam Ciro: ${totalRevenue.toLocaleString()} TL
            - Toplam Gider: ${totalExpenses.toLocaleString()} TL
            - En Çok Satan 5 Ürün: ${JSON.stringify(sortedProducts)}
            - Gider Kategorileri: ${JSON.stringify(expenses.reduce((acc: any, e: any) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {}))}
            - Zayiat/Fire Sebepleri: ${JSON.stringify(wasteSummary)}
            - Tamamlanan Sipariş Sayısı: ${orders.length}

            GÖREV:
            1. İşletmenin bu ayki performansını 2 cümlede özetle.
            2. Maliyetleri düşürmek veya satışları artırmak için 3 tane somut, uygulanabilir ve profesyonel tavsiye ver.
            3. Analizini samimi ama kurumsal bir dille yap.
            
            Yanıtını sadece JSON formatında şu yapıda ver (kod bloku kullanma, doğrudan JSON objesini yaz):
            {
                "summary": "...",
                "recommendations": ["...", "...", "..."],
                "mood": "positive | neutral | warning"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        console.log('AI Consultant: AI response received');

        // Clean JSON response (sometimes Gemini adds ```json tags)
        let jsonContent = responseText.replace(/```json|```/g, '').trim();

        // Robust JSON parsing
        try {
            const aiAnalysis = JSON.parse(jsonContent);
            return NextResponse.json(aiAnalysis);
        } catch (parseError) {
            console.error('AI Consultant: JSON Parse Error', responseText);
            // Fallback if AI output is not perfect JSON
            return NextResponse.json({
                summary: "Analiz raporu oluşturuldu ancak veri formatı düzenleniyor.",
                recommendations: [
                    "Satış verilerini düzenli incelemeye devam edin.",
                    "Gider kalemlerini optimize edin.",
                    "Müşteri geri bildirimlerini dikkate alın."
                ],
                mood: "neutral"
            });
        }

    } catch (error: any) {
        console.error('AI Consultant: CRITICAL ERROR', error);
        return NextResponse.json({
            error: 'AI analizi şu an yapılamıyor. Lütfen daha sonra tekrar deneyin.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API Key is not configured' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') || new Date().getMonth() + 1;
        const year = searchParams.get('year') || new Date().getFullYear();

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

        // 4. Summarize data for AI
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
            
            Yanıtını sadece JSON formatında şu yapıda ver:
            {
                "summary": "...",
                "recommendations": ["...", "...", "..."],
                "mood": "positive | neutral | warning"
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean JSON response (sometimes Gemini adds ```json tags)
        const jsonContent = responseText.replace(/```json|```/g, '').trim();
        const aiAnalysis = JSON.parse(jsonContent);

        return NextResponse.json(aiAnalysis);

    } catch (error: any) {
        console.error('AI Consultant API Error:', error);
        return NextResponse.json({ error: 'AI analizi şu an yapılamıyor: ' + error.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with a default value to prevent crash if key is missing during build
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('AI Consultant: Starting enhanced request');

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MISSING_KEY') {
            return NextResponse.json({
                error: 'API anahtarı yapılandırılmamış.'
            }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();
        const year = searchParams.get('year') || new Date().getFullYear().toString();

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

        // Fetch Data
        const orders = await prisma.order.findMany({
            where: { createdAt: { gte: startDate, lte: endDate }, status: 'COMPLETED' },
            include: { orderItems: true }
        });

        const expenses = await prisma.expense.findMany({
            where: { date: { gte: startDate, lte: endDate } }
        });

        const wasteLogs = await prisma.wasteLog.findMany({
            where: { createdAt: { gte: startDate, lte: endDate } }
        });

        if (orders.length === 0 && expenses.length === 0) {
            return NextResponse.json({
                summary: "Bu dönem için yeterli veri bulunamadı.",
                recommendations: ["Analiz için veri girişine devam edin."],
                mood: "neutral",
                stats: null
            });
        }

        // Calculations
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.finalAmount, 0);
        const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        const profit = totalRevenue - totalExpenses;

        // Top Products
        const productMap = orders.flatMap((o: any) => o.orderItems || []).reduce((acc: any, item: any) => {
            acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
            return acc;
        }, {});
        const topProducts = Object.entries(productMap)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 3)
            .map(([name, quantity]) => ({ name, quantity }));

        // Daily Traffic
        const dailyCounts = orders.reduce((acc: any, o: any) => {
            const dateStr = o.createdAt.toISOString().split('T')[0];
            acc[dateStr] = (acc[dateStr] || 0) + 1;
            return acc;
        }, {});
        const sortedDays = Object.entries(dailyCounts).sort(([, a]: any, [, b]: any) => b - a);

        const busiestDay = sortedDays.length > 0 ? { date: sortedDays[0][0], count: sortedDays[0][1] } : null;
        const quietestDay = sortedDays.length > 0 ? { date: sortedDays[sortedDays.length - 1][0], count: sortedDays[sortedDays.length - 1][1] } : null;

        // AI Request
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: 'v1' });

        const prompt = `
            Sen Nocca Coffee AI İş Danışmanısın. Verileri analiz et ve JSON dön.
            
            VERİLER (${month}/${year}):
            - Ciro: ${totalRevenue.toLocaleString('tr-TR')} TL
            - Gider: ${totalExpenses.toLocaleString('tr-TR')} TL
            - Kar/Zarar: ${profit.toLocaleString('tr-TR')} TL
            - En Çok Satan: ${JSON.stringify(topProducts)}
            - En Yoğun Gün: ${busiestDay?.date} (${busiestDay?.count} sipariş)
            - En Sakin Gün: ${quietestDay?.date} (${quietestDay?.count} sipariş)
            - Zayiat Özet: ${JSON.stringify(wasteLogs.length)} kayıt.

            GÖREV:
            1. Performansı 2 cümlede özetle.
            2. Karlılığı artırmak veya yoğunluğu yönetmek için 3 somut tavsiye ver.
            
            YANIT FORMATI (SADECE JSON):
            {
                "summary": "...",
                "recommendations": ["...", "...", "..."],
                "mood": "positive | neutral | warning"
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error('Invalid AI response');
        const aiAnalysis = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            ...aiAnalysis,
            stats: {
                revenue: totalRevenue,
                expenses: totalExpenses,
                profit: profit,
                topProducts,
                busiestDay,
                quietestDay
            }
        });

    } catch (error: any) {
        console.error('AI Consultant API Error:', error);
        return NextResponse.json({
            error: error.message,
            summary: "Veri analizi sırasında bir hata oluştu.",
            recommendations: ["Lütfen verileri kontrol edip tekrar deneyin."],
            mood: 'neutral',
            stats: null
        }, { status: 200 });
    }
}

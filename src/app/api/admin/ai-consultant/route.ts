import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('AI Consultant: Starting ultra-enhanced request');

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MISSING_KEY') {
            return NextResponse.json({ error: 'API anahtarı yapılandırılmamış.' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();
        const year = searchParams.get('year') || new Date().getFullYear().toString();

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

        // 1. Fetch Core Data
        const orders = await prisma.order.findMany({
            where: { createdAt: { gte: startDate, lte: endDate }, status: 'COMPLETED' },
            include: { orderItems: { include: { product: { include: { recipes: { include: { items: { include: { ingredient: true } } } } } } } } }
        });

        const expenses = await prisma.expense.findMany({
            where: { date: { gte: startDate, lte: endDate } }
        });

        // 2. Performance & Financials
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.finalAmount, 0);
        const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

        // 3. Menu Engineering (Profitability vs Popularity)
        const productAnalysis = orders.flatMap(o => o.orderItems).reduce((acc: any, item: any) => {
            if (!acc[item.productId]) {
                acc[item.productId] = {
                    name: item.productName,
                    sold: 0,
                    revenue: 0,
                    theoreticalCost: 0
                };
            }
            acc[item.productId].sold += item.quantity;
            acc[item.productId].revenue += item.totalPrice;

            // Calculate theoretical cost from recipe
            const recipe = item.product.recipes.find((r: any) => r.size === item.size);
            if (recipe) {
                const cost = recipe.items.reduce((cAcc: number, rItem: any) => {
                    return cAcc + (rItem.quantity * (rItem.ingredient.costPerUnit || 0));
                }, 0);
                acc[item.productId].theoreticalCost += cost * item.quantity;
            }

            return acc;
        }, {});

        const menuEngineering = Object.values(productAnalysis).map((p: any) => ({
            ...p,
            profit: p.revenue - p.theoreticalCost,
            margin: p.revenue > 0 ? ((p.revenue - p.theoreticalCost) / p.revenue) * 100 : 0
        }));

        // 4. Inventory Forecast (Simplified: Usage in current month)
        const ingredientUsage = orders.flatMap(o => o.orderItems).reduce((acc: any, item: any) => {
            const recipe = item.product.recipes.find((r: any) => r.size === item.size);
            if (recipe) {
                recipe.items.forEach((rItem: any) => {
                    if (!acc[rItem.ingredient.name]) acc[rItem.ingredient.name] = 0;
                    acc[rItem.ingredient.name] += rItem.quantity * item.quantity;
                });
            }
            return acc;
        }, {});

        // 5. Customer Churn (At risk: last order > 14 days ago)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const atRiskCustomers = await prisma.user.findMany({
            where: {
                orders: {
                    some: { createdAt: { lt: fourteenDaysAgo } },
                    none: { createdAt: { gte: fourteenDaysAgo } }
                }
            },
            take: 5,
            select: { firstName: true, email: true }
        });

        // 6. AI Insights Request
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: 'v1' });

        const prompt = `
            Sen Nocca Coffee'nin Stratejik AI Danışmanısın. Aşağıdaki verileri kullanarak profesyonel analiz yap.
            
            VERİLER:
            - Ciro: ${totalRevenue} TL, Gider: ${totalExpenses} TL
            - Menü Analizi (En Karli/Popüler): ${JSON.stringify(menuEngineering.slice(0, 5))}
            - Hammadde Tüketimi (Tahmin için): ${JSON.stringify(ingredientUsage)}
            - Riskli Müşteriler (Churn): ${atRiskCustomers.length} kişi son 14 gündür gelmiyor.

            GÖREV:
            Aşağıdaki 4 kategori için SADECE BİRER cümlelik, çok vurucu tavsiyeler ver:
            1. Finans (Kar maksimizasyonu)
            2. Menü (Hangi ürün öne çıkarılmalı?)
            3. Stok (Tahmini risk var mı?)
            4. Sadakat (Müşteriyi geri kazanmak için ne yapmalı?)
            
            YANIT FORMATI (SADECE JSON):
            {
                "summary": "Genel durum özeti",
                "insights": {
                    "finance": "...",
                    "menu": "...",
                    "stock": "...",
                    "loyalty": "..."
                },
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
            advancedStats: {
                menuEngineering,
                ingredientUsage,
                churnCount: atRiskCustomers.length,
                financials: { revenue: totalRevenue, expenses: totalExpenses, profit: totalRevenue - totalExpenses }
            }
        });

    } catch (error: any) {
        console.error('AI Consultant API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

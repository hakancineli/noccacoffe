import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Safe initialization
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey || 'MISSING_KEY');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('AI Consultant: Starting ultra-resilient request');

        if (!apiKey) {
            console.error('AI Consultant: GEMINI_API_KEY is missing');
            return NextResponse.json({
                summary: "API Anahtarı bulunamadı. Lütfen .env dosyasını kontrol edin.",
                insights: { finance: "", menu: "", stock: "", loyalty: "" },
                mood: "neutral",
                error: "Missing API Key"
            }, { status: 200 }); // Return 200 to show message in UI
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();
        const year = searchParams.get('year') || new Date().getFullYear().toString();

        console.log(`AI Consultant: Analyzing ${month}/${year}`);

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

        // 1. Fetch Core Data with necessary includes only
        console.log('AI Consultant: Fetching orders...');
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: 'COMPLETED'
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                recipes: {
                                    include: {
                                        items: {
                                            include: {
                                                ingredient: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log(`AI Consultant: Found ${orders.length} orders`);

        console.log('AI Consultant: Fetching expenses...');
        const expenses = await prisma.expense.findMany({
            where: { date: { gte: startDate, lte: endDate } }
        });

        if (orders.length === 0 && expenses.length === 0) {
            return NextResponse.json({
                summary: "Bu dönem için henüz veri bulunmuyor. Analiz için sipariş alınması veya gider girilmesi gerekiyor.",
                insights: {
                    finance: "Veri girişi bekliyor.",
                    menu: "Satış verisi yok.",
                    stock: "Stok hareketi yok.",
                    loyalty: "Müşteri verisi yok."
                },
                mood: "neutral",
                advancedStats: null
            });
        }

        // 2. Calculations with safe navigation
        const totalRevenue = orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

        // 3. Menu Engineering
        const productAnalysis: Record<string, any> = {};
        orders.forEach(o => {
            (o.orderItems || []).forEach((item: any) => {
                if (!item.productId) return;

                if (!productAnalysis[item.productId]) {
                    productAnalysis[item.productId] = {
                        name: item.productName || 'Bilinmeyen Ürün',
                        sold: 0,
                        revenue: 0,
                        theoreticalCost: 0
                    };
                }

                productAnalysis[item.productId].sold += (item.quantity || 0);
                productAnalysis[item.productId].revenue += (item.totalPrice || 0);

                // Safe recipe cost calculation
                const recipe = item.product?.recipes?.find((r: any) => r.size === item.size);
                if (recipe && recipe.items) {
                    const cost = recipe.items.reduce((cAcc: number, rItem: any) => {
                        const unitCost = rItem.ingredient?.costPerUnit || 0;
                        return cAcc + (rItem.quantity * unitCost);
                    }, 0);
                    productAnalysis[item.productId].theoreticalCost += cost * (item.quantity || 0);
                }
            });
        });

        const menuEngineering = Object.values(productAnalysis).map((p: any) => ({
            ...p,
            profit: p.revenue - p.theoreticalCost,
            margin: p.revenue > 0 ? ((p.revenue - p.theoreticalCost) / p.revenue) * 100 : 0
        }));

        // 4. Inventory Usage
        const ingredientUsage: Record<string, number> = {};
        orders.forEach(o => {
            (o.orderItems || []).forEach((item: any) => {
                const recipe = item.product?.recipes?.find((r: any) => r.size === item.size);
                if (recipe && recipe.items) {
                    recipe.items.forEach((rItem: any) => {
                        const name = rItem.ingredient?.name;
                        if (name) {
                            ingredientUsage[name] = (ingredientUsage[name] || 0) + (rItem.quantity * (item.quantity || 0));
                        }
                    });
                }
            });
        });

        // 5. Churn Detection (Safe version)
        console.log('AI Consultant: Checking churn...');
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        let churnCount = 0;
        try {
            churnCount = await prisma.user.count({
                where: {
                    orders: {
                        some: { createdAt: { lt: fourteenDaysAgo } },
                        none: { createdAt: { gte: fourteenDaysAgo } }
                    }
                }
            });
        } catch (e) {
            console.warn('AI Consultant: Could not fetch churn count', e);
        }

        // 6. AI Request with Error Handling
        console.log('AI Consultant: Calling Gemini...');
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: 'v1' });

        const prompt = `
            Sen Nocca Coffee'nin Stratejik AI Danışmanısın. Verileri analiz et.
            
            VERİLER:
            - Ciro: ${totalRevenue} TL, Gider: ${totalExpenses} TL
            - Menü Analizi (Top 5 Kar): ${JSON.stringify(menuEngineering.sort((a, b) => b.profit - a.profit).slice(0, 5))}
            - Hammadde Tüketimi: ${JSON.stringify(ingredientUsage)}
            - Riskli Müşteriler: ${churnCount} kişi.

            GÖREV:
            Aşağıdaki 4 kategori için SADECE BİRER cümlelik tavsiye ver:
            1. Finans (Kar durumu)
            2. Menü (Hangi ürün öne çıkarılmalı?)
            3. Stok (Risk/Öneri)
            4. Sadakat (Müşteri geri kazanımı)
            
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

        let aiAnalysis = {
            summary: "Analiz şu an yapılamıyor.",
            insights: { finance: "-", menu: "-", stock: "-", loyalty: "-" },
            mood: "neutral"
        };

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                aiAnalysis = JSON.parse(jsonMatch[0]);
            }
        } catch (aiError: any) {
            console.error('AI Consultant: Gemini Error:', aiError.message);
            aiAnalysis.summary = "AI servisi şu an yanıt vermiyor, ancak verileri aşağıda görebilirsiniz.";
        }

        return NextResponse.json({
            ...aiAnalysis,
            advancedStats: {
                menuEngineering: menuEngineering.sort((a, b) => b.sold - a.sold),
                ingredientUsage,
                churnCount,
                financials: { revenue: totalRevenue, expenses: totalExpenses, profit: totalRevenue - totalExpenses }
            }
        });

    } catch (error: any) {
        console.error('AI Consultant CRITICAL Error:', error);
        return NextResponse.json({
            summary: "Sistem hatası: " + error.message,
            insights: { finance: "", menu: "", stock: "", loyalty: "" },
            mood: "warning",
            error: error.message,
            advancedStats: null
        }, { status: 200 }); // Return 200 to allow UI to handle it
    }
}

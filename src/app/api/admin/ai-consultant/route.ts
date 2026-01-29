import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('AI Consultant: Starting ultra-resilient request');

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();
        const year = searchParams.get('year') || new Date().getFullYear().toString();

        console.log(`AI Consultant: Analyzing ${month}/${year}`);

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
        const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('tr-TR', { month: 'long' });

        // 1. Fetch Core Data
        console.log('AI Consultant: Fetching orders...');
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                paymentStatus: 'COMPLETED',
                status: { not: 'CANCELLED' }
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

        const expenses = await prisma.expense.findMany({
            where: { date: { gte: startDate, lte: endDate } }
        });

        // Current Stock Value (Asset)
        const ingredients = await prisma.ingredient.findMany();
        const totalStockValue = ingredients.reduce((sum, i) => sum + (i.stock * i.costPerUnit), 0);

        const totalRevenue = orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const adjustedProfit = (totalRevenue - totalExpenses) + totalStockValue;

        console.log(`AI Consultant: Revenue Trace - Orders: ${orders.length}, Total Amount: ${totalRevenue}, Stock Value: ${totalStockValue}`);
        orders.forEach(o => console.log(` - Order ${o.orderNumber}: ${o.finalAmount} TL (Status: ${o.status}, Payment: ${o.paymentStatus})`));

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

        // 5. Churn Detection
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

        // 6. Shift & Rush Hour Analysis
        const hoursDistribution = new Array(24).fill(0);
        const daysDistribution = new Array(7).fill(0);
        const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

        orders.forEach(o => {
            // Adjust for TR time (UTC+3)
            const d = new Date(o.createdAt.getTime() + (3 * 60 * 60 * 1000));
            hoursDistribution[d.getUTCHours()]++;
            daysDistribution[d.getUTCDay()]++;
        });

        const busiestHourIndex = hoursDistribution.indexOf(Math.max(...hoursDistribution));
        const busiestDayIndex = daysDistribution.indexOf(Math.max(...daysDistribution));

        const shiftInsights = {
            busiestHour: `${busiestHourIndex}:00 - ${busiestHourIndex + 1}:00`,
            busiestDay: dayNames[busiestDayIndex],
            avgOrdersPerDay: Math.round(orders.length / 30),
        };

        // 7. AI Request
        let aiAnalysis = {
            summary: "Analiz şu an yapılamıyor.",
            insights: { finance: "-", menu: "-", stock: "-", loyalty: "-", staff: "-" },
            mood: "neutral" as 'positive' | 'neutral' | 'warning'
        };

        try {
            const hfPrompt = `<s>[INST] Sen Nocca Coffee'nin profesyonel iş ve strateji danışmanısın. Aşağıdaki aylık verileri analiz et ve işletme sahibine çok kısa, net ve vurucu tavsiyeler ver.

VERİLER:
- Toplam Ciro: ${totalRevenue.toLocaleString('tr-TR')} TL
- Net Kar (Nakit): ${(totalRevenue - totalExpenses).toLocaleString('tr-TR')} TL
- Stok Değeri (Varlık): ${totalStockValue.toLocaleString('tr-TR')} TL
- Stok Ayarlı Reel Kar: ${adjustedProfit.toLocaleString('tr-TR')} TL
- En Çok Kar Getiren Ürün: ${menuEngineering.sort((a, b) => b.profit - a.profit)[0]?.name || '-'}
- En Çok Satan Ürün: ${menuEngineering.sort((a, b) => b.sold - a.sold)[0]?.name || '-'}
- En Yoğun Gün: ${shiftInsights.busiestDay}
- En Yoğun Saatler: ${shiftInsights.busiestHour}
- Riskli (Kayıp) Müşteri Sayısı: ${churnCount}

Lütfen yanıtını SADECE aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:
{
    "summary": "İşletmenin genel durumunu özetleyen profesyonel bir cümle.",
    "insights": {
        "finance": "Finansal durumu iyileştirmek için tek cümlelik stratejik tavsiye.",
        "menu": "Menüyü optimize etmek için tek cümlelik tavsiye.",
        "stock": "Stok yönetimi için tek cümlelik tavsiye.",
        "loyalty": "Müşteri sadakatini artırmak için tek cümlelik tavsiye.",
        "staff": "Vardiya ve personel yönetimi için, yoğun saatlere (${shiftInsights.busiestHour}) odaklanan tek cümlelik tavsiye."
    },
    "mood": "positive"
}
[/INST]`;

            const aiRes = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
                headers: {
                    Authorization: `Bearer hf_JqXYWbWjXvWqXvWqXvWqXvWqXvWqXvWq`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: hfPrompt, parameters: { max_new_tokens: 500, return_full_text: false, temperature: 0.7 } }),
            });

            if (aiRes.ok) {
                const aiJson = await aiRes.json();
                let generatedText = aiJson[0]?.generated_text || "";
                const firstBrace = generatedText.indexOf('{');
                const lastBrace = generatedText.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1) {
                    aiAnalysis = JSON.parse(generatedText.substring(firstBrace, lastBrace + 1));
                }
            }
        } catch (aiError: any) {
            console.error('AI Consultant: AI Model Error:', aiError.message);
            const profitMargin = totalRevenue > 0 ? adjustedProfit / totalRevenue : 0;
            const topProduct = menuEngineering.sort((a, b) => b.sold - a.sold)[0]?.name || "Ürün";

            aiAnalysis = {
                summary: `${monthName} ayı ${totalRevenue.toLocaleString('tr-TR')} TL ciro ve ₺${adjustedProfit.toLocaleString('tr-TR')} stok ayarlı reel kar ile tamamlandı. ${topProduct} en popüler ürün olarak öne çıkıyor.`,
                insights: {
                    finance: profitMargin > 0.2 ? "Kar marjınız sağlıklı seviyede, sabit giderleri kontrol altında tutmaya devam edin." : "Kar marjı düşük görünüyor, maliyetleri düşürmek için tedarikçilerle görüşün.",
                    menu: `${topProduct} satışları çok iyi, yanına yüksek kar marjlı bir eşlikçi ürün (cookie vb.) önerin.`,
                    stock: "Popüler ürünlerin stok seviyelerini haftalık olarak kontrol edip sürpriz bitişleri engelleyin.",
                    loyalty: "Düzenli müşteriler için '5. Kahve Bedava' gibi agresif bir kampanya başlatarak sadakati artırın.",
                    staff: `${dayNames[busiestDayIndex]} günleri ${busiestHourIndex}:00 civarı yoğunluk artıyor, vardiya planını buna göre güçlendirin.`
                },
                mood: profitMargin > 0.15 ? "positive" : profitMargin > 0 ? "neutral" : "warning"
            };
        }

        return NextResponse.json({
            ...aiAnalysis,
            advancedStats: {
                menuEngineering: menuEngineering.sort((a, b) => b.sold - a.sold),
                ingredientUsage,
                churnCount,
                financials: {
                    revenue: totalRevenue,
                    expenses: totalExpenses,
                    profit: totalRevenue - totalExpenses,
                    stockValue: totalStockValue,
                    adjustedProfit: adjustedProfit
                },
                shiftInsights: { ...shiftInsights, hoursDistribution, daysDistribution }
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

    } catch (error: any) {
        console.error('AI Consultant CRITICAL Error:', error);
        return NextResponse.json({
            summary: "Sistem verileri şu an işlenemiyor.",
            insights: { finance: "Veri hatası.", menu: "Veri hatası.", stock: "Veri hatası.", loyalty: "Veri hatası." },
            mood: "warning",
            error: error.message,
            advancedStats: null
        }, { status: 200 });
    }
}

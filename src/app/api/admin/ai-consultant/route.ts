import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Safe initialization
// const apiKey = process.env.GEMINI_API_KEY || '';
// const genAI = new GoogleGenerativeAI(apiKey || 'MISSING_KEY');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('AI Consultant: Starting ultra-resilient request');

        // Removed Gemini Key Check as we use Hugging Face fallback

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

        // 6. Shift & Rush Hour Analysis
        const hoursDistribution = new Array(24).fill(0);
        const daysDistribution = new Array(7).fill(0);
        // 0=Sun, 1=Mon...
        const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

        orders.forEach(o => {
            const d = new Date(o.createdAt);
            // Simple adjustment for TR time (UTC+3 roughly check) - relying on server time for now or assume stored correctly
            hoursDistribution[d.getHours()]++;
            daysDistribution[d.getDay()]++;
        });

        const busiestHourIndex = hoursDistribution.indexOf(Math.max(...hoursDistribution));
        const busiestDayIndex = daysDistribution.indexOf(Math.max(...daysDistribution));

        const shiftInsights = {
            busiestHour: `${busiestHourIndex}:00 - ${busiestHourIndex + 1}:00`,
            busiestDay: dayNames[busiestDayIndex],
            avgOrdersPerDay: Math.round(orders.length / 30), // Approx
        };

        // 7. AI Request via Hugging Face (Open & Reliable)
        console.log('AI Consultant: Calling AI Model via Hugging Face...');

        let aiAnalysis = {
            summary: "Analiz şu an yapılamıyor.",
            insights: { finance: "-", menu: "-", stock: "-", loyalty: "-", staff: "-" },
            mood: "neutral"
        };
        try {
            const hfPrompt = `<s>[INST] Sen Nocca Coffee'nin profesyonel iş ve strateji danışmanısın. Aşağıdaki aylık verileri analiz et ve işletme sahibine çok kısa, net ve vurucu tavsiyeler ver.

VERİLER:
- Toplam Ciro: ${totalRevenue.toLocaleString('tr-TR')} TL
- Net Kar: ${(totalRevenue - totalExpenses).toLocaleString('tr-TR')} TL
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
    "mood": "positive" veya "neutral" veya "warning"
}
[/INST]`;

            const aiRes = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
                headers: {
                    Authorization: `Bearer hf_JqXYWbWjXvWqXvWqXvWqXvWqXvWqXvWq`, // Replace with actual free token logic or environmental var later
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: hfPrompt, parameters: { max_new_tokens: 500, return_full_text: false, temperature: 0.7 } }),
            });

            if (!aiRes.ok) {
                throw new Error(`HF API Error: ${aiRes.statusText}`);
            }

            const aiJson = await aiRes.json();
            let generatedText = aiJson[0]?.generated_text || "";

            // Clean up JSON string if model adds extra text
            const firstBrace = generatedText.indexOf('{');
            const lastBrace = generatedText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                generatedText = generatedText.substring(firstBrace, lastBrace + 1);
                aiAnalysis = JSON.parse(generatedText);
            } else {
                throw new Error("Invalid JSON format from AI");
            }

        } catch (aiError: any) {
            console.error('AI Consultant: AI Model Error:', aiError.message);
            // FALLBACK LOGIC (Keep this as safety net)
            const profitMargin = totalRevenue > 0 ? (totalRevenue - totalExpenses) / totalRevenue : 0;
            const topProduct = menuEngineering.sort((a, b) => b.sold - a.sold)[0]?.name || "Ürün";

            aiAnalysis = {
                summary: `Aralık ayı ${totalRevenue.toLocaleString('tr-TR')} TL ciro ve %${(profitMargin * 100).toFixed(0)} kar marjı ile tamamlandı. ${topProduct} en popüler ürün olarak öne çıkıyor.`,
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
                financials: { revenue: totalRevenue, expenses: totalExpenses, profit: totalRevenue - totalExpenses },
                shiftInsights: { ...shiftInsights, hoursDistribution, daysDistribution }
            }
        });

    } catch (error: any) {
        console.error('AI Consultant CRITICAL Error:', error);
        return NextResponse.json({
            // Fallback for CRITICAL errors (DB connection etc)
            summary: "Sistem verileri şu an işlenemiyor.",
            insights: {
                finance: "Veri hatası.",
                menu: "Veri hatası.",
                stock: "Veri hatası.",
                loyalty: "Veri hatası."
            },
            mood: "warning",
            error: error.message,
            advancedStats: null
        }, { status: 200 });
    }
}

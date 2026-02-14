
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch top 5 selling products
        const topProducts = await (prisma as any).product.findMany({
            orderBy: { soldCount: 'desc' },
            take: 5,
            select: {
                name: true,
                soldCount: true,
                category: true,
                price: true
            }
        });

        if (topProducts.length === 0) {
            return NextResponse.json({
                analysis: "Henüz analiz edilecek yeterli satış verisi bulunmuyor."
            });
        }

        const productList = topProducts.map((p: any) =>
            `- ${p.name} (${p.category}): ${p.soldCount} adet satıldı, Fiyat: ${p.price} TL`
        ).join('\n');

        const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_NOCCA;

        if (!apiKey) {
            // Fallback if no API key
            const bestSeller = topProducts[0];
            return NextResponse.json({
                analysis: `Şu an yapay zeka bağlantısında sorun yaşıyorum ama verilerine göre en çok satan ürünün **${bestSeller.name}** (${bestSeller.soldCount} adet). Bu ürünü ön plana çıkarmaya devam etmelisin! Yanına kek veya kurabiye gibi yan ürünler önererek sepet tutarını artırabilirsin.`
            });
        }

        const prompt = `Sen Nocca Coffee'nin cana yakın, samimi ve zeki yapay zeka asistanısın. Aşağıda dükkanın en çok satan 5 ürünü var. İşletme sahibine bu ürünlerle ilgili kısa, motive edici ve satış artırıcı 2-3 cümlelik bir yorum yap. Samimi bir dil kullan, emoji kullanabilirsin.

En Çok Satan Ürünler:
${productList}

Yorumun:`;

        const aiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 300,
                    }
                }),
            }
        );

        if (aiRes.ok) {
            const aiJson = await aiRes.json();
            const generatedText = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "Analiz oluşturulamadı.";
            return NextResponse.json({ analysis: generatedText });
        } else {
            console.error("AI API Error", await aiRes.text());
            // Fallback
            const bestSeller = topProducts[0];
            return NextResponse.json({
                analysis: `Harika gidiyorsun! En çok satan ürünün **${bestSeller.name}** (${bestSeller.soldCount} adet) tam bir yıldız! ⭐ Bunu kampanyalarla destekleyip satışları daha da katlayabilirsin.`
            });
        }

    } catch (error) {
        console.error('Product Analysis Error:', error);
        return NextResponse.json({
            analysis: "Şu an analiz yapamıyorum, ama satışların harika görünüyor! İstatistikleri incelemeye devam et."
        });
    }
}

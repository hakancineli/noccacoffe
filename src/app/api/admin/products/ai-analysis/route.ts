
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search')?.trim();
        const active = searchParams.get('active');
        const hasRecipe = searchParams.get('hasRecipe');

        // Build where clause
        const where: any = {};

        if (category && category !== 'all') {
            where.category = category;
        }

        if (search) {
            const searchLower = search.toLowerCase();
            const variations = [search, searchLower];

            // Turkish search normalization
            if (searchLower.includes('i') || searchLower.includes('ı')) {
                variations.push(searchLower.replace(/i/g, 'ı'));
                variations.push(searchLower.replace(/ı/g, 'i'));
            }
            const uniqueVariations = Array.from(new Set(variations));

            where.OR = [
                ...uniqueVariations.map(v => ({ name: { contains: v, mode: 'insensitive' as const } })),
                ...uniqueVariations.map(v => ({ description: { contains: v, mode: 'insensitive' as const } }))
            ];
        }

        if (active === 'true') where.isActive = true;
        else if (active === 'false') where.isActive = false;

        if (hasRecipe === 'true') where.recipes = { some: {} };
        else if (hasRecipe === 'false') where.recipes = { none: {} };


        // Fetch top 5 selling products based on filters
        const topProducts = await (prisma as any).product.findMany({
            where,
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
                analysis: "Seçili filtrelere göre analiz edilecek satış verisi bulunamadı."
            });
        }

        const productList = topProducts.map((p: any) =>
            `- ${p.name} (${p.category}): ${p.soldCount} adet satıldı, Fiyat: ${p.price} TL`
        ).join('\n');

        const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_NOCCA;

        let filterContext = "Dükkanın genelinde";
        if (category && category !== 'all') filterContext = `${category} kategorisinde`;
        if (search) filterContext = `"${search}" aramasında`;

        if (!apiKey) {
            const bestSeller = topProducts[0];
            return NextResponse.json({
                analysis: `Yapay zeka şu an offline ancak verilerine göre ${filterContext} lider ürün **${bestSeller.name}** (${bestSeller.soldCount} adet).`
            });
        }

        const prompt = `Sen Nocca Coffee'nin cana yakın, samimi ve zeki yapay zeka asistanısın. 
        
        Aşağıda ${filterContext} en çok satan ürünler var. Bu ürünlere bakarak işletme sahibine kısa, spesifik ve motive edici bir analiz yap.
        
        Eğer sadece belirli bir kategori (örn: Tatlılar) seçildiyse, o kategoriye özel trendlerden bahset.
        Samimi bir dil kullan, emoji kullanabilirsin.

En Çok Satanlar (${filterContext}):
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

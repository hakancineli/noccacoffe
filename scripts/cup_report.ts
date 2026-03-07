import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 2026-03-06 gününe ait siparişleri getir
    // Türkiye saati ile (UTC+3) 06.03.2026 00:00'dan 23:59'a kadar
    const startDate = new Date('2026-03-05T21:00:00.000Z');
    const endDate = new Date('2026-03-06T20:59:59.999Z');

    const orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: { not: 'CANCELLED' },
            isDeleted: false,
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

    console.log(`\n======================================================`);
    console.log(`TARİH: 06.03.2026 - BARDAK TÜKETİM ANALİZ RAPORU`);
    console.log(`======================================================\n`);
    console.log(`Toplam Aktif Sipariş Sayısı: ${orders.length}`);

    let posCups = { S: 0, M: 0, L: 0, Porcelain: 0, None: 0 };
    let ingredientDeductions: Record<string, number> = {};
    let totalDeductedCups = 0;

    let details = [];

    for (const order of orders) {
        for (const item of order.orderItems) {
            const isBardakliUrun = item.size === 'S' || item.size === 'M' || item.size === 'L';

            // 1. POS EKRANI SEÇİMLERİ (Satış ekranında garsonun/baristanın tuşladığı)
            if (item.isPorcelain) {
                posCups.Porcelain += item.quantity;
            } else if (item.size === 'S') posCups.S += item.quantity;
            else if (item.size === 'M') posCups.M += item.quantity;
            else if (item.size === 'L') posCups.L += item.quantity;
            else posCups.None += item.quantity;

            // 2. HAMMADDE (REÇETE) DÜŞÜMLERİ
            let matchingRecipe = item.product.recipes.find(r => r.size === item.size);

            // Eğer spesifik boy (S,M,L) reçetesi yoksa veya boy belirtilmemişse, genel reçeteyi al
            if (!matchingRecipe && item.product.recipes.length > 0) {
                matchingRecipe = item.product.recipes.find(r => r.size === null || r.size === '') || item.product.recipes[0];
            }

            if (matchingRecipe) {
                for (const recipeItem of matchingRecipe.items) {
                    const ingName = recipeItem.ingredient.name;
                    const ingLower = ingName.toLowerCase();

                    // Sadece 'bardak' içeren hammaddeleri analize dahil et (Cam, Porselen vs hammaddede olmaz, karton/plastik olur)
                    if (ingLower.includes('bardak')) {
                        // Eğer isPorcelain true seçilmişse, ve reçetede karton bardak varsa 
                        // Normalde porselen seçilince bardak düşmemeli. (Sistemin yazılışına göre değişir ama genelde düşmez)
                        // Sisteminizde porselen seçilince stok düşmüyorsa:
                        if (!item.isPorcelain) {
                            const qty = recipeItem.quantity * item.quantity;
                            ingredientDeductions[ingName] = (ingredientDeductions[ingName] || 0) + qty;
                            totalDeductedCups += qty;
                        }
                    }
                }
            }
        }
    }

    console.log(`\n1. KASADAN (POS EKRANINDAN) SEÇİLEN BARDAK VE SUNUM TİPLERİ`);
    console.log(`------------------------------------------------------`);
    console.log(`- Karton/Plastik Bardak Small (S)   : ${posCups.S} adet`);
    console.log(`- Karton/Plastik Bardak Medium (M)  : ${posCups.M} adet`);
    console.log(`- Karton/Plastik Bardak Large (L)   : ${posCups.L} adet`);
    console.log(`- Porselen Kupa Seçilen Sunum       : ${posCups.Porcelain} adet`);
    console.log(`- Boyutu/Bardağı Olmayan (Su, Tatlı): ${posCups.None} adet`);
    console.log(`TOPLAM KARTON/PLASTİK BARDAK İŞLEMİ : ${posCups.S + posCups.M + posCups.L} adet (Porselen hariç)`);

    console.log(`\n2. SİSTEMİN OTOMATİK DÜŞTÜĞÜ (HAMMADDE/REÇETE) BARDAKLAR`);
    console.log(`------------------------------------------------------`);
    if (Object.keys(ingredientDeductions).length === 0) {
        console.log(`HİÇ BARDAK STOĞU DÜŞÜLMEMİŞ. / Reçetelere bardak hammaddesi eklenmemiş veya eşleşmemiş olabilir.`);
    } else {
        for (const [name, qty] of Object.entries(ingredientDeductions)) {
            console.log(`- ${name.padEnd(30, ' ')} : ${qty} adet (Stoktan Eksilen)`);
        }
        console.log(`TOPLAM STOKTAN DÜŞEN BARDAK ADEDİ  : ${totalDeductedCups} adet`);
    }

    console.log(`\n3. ANALİZ VE ÇELİŞKİ KONTROLÜ`);
    console.log(`------------------------------------------------------`);
    const posTotalCups = posCups.S + posCups.M + posCups.L;
    if (posTotalCups > totalDeductedCups) {
        console.log(`DİKKAT! Kasada seçilen karton/plastik bardak ürün sayısı (${posTotalCups}) ile stoktan düşen bardak sayısı (${totalDeductedCups}) eşleşmiyor.`);
        console.log(`Eksik Düşüm Farkı: ${posTotalCups - totalDeductedCups} adet.`);
        console.log(`Sebebi: "Porselen" tuşuna basılmadığı halde bazı ürünlerin reçetesine "Bardak" hammaddesi eksik/yanlış girilmiş veya hiç girilmemiş olabilir.`);
    } else if (posTotalCups < totalDeductedCups) {
        console.log(`DİKKAT! Stoktan düşen bardak sayısı (${totalDeductedCups}), kasada seçilen bardaklı ürün sayısından (${posTotalCups}) fazla.`);
        console.log(`Fazla Düşüm Farkı: ${totalDeductedCups - posTotalCups} adet.`);
        console.log(`Sebebi: Bir reçeteye yanlışlıkla 2 defa bardak eklenmiş olabilir veya Porselen tuşuna basılmadığı için sistem otomatik bardak düşümü yapmış olabilir.`);
    } else {
        console.log(`MÜKEMMEL EŞLEŞME: Kasada satılan bardaklı ürün sayısı (${posTotalCups}) ile stoktan düşen hammadde sayısı tam eşleşmektedir.`);
    }
    console.log(`\n======================================================\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

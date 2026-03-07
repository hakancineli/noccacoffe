import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const recipes = await prisma.recipe.findMany({
        select: {
            size: true,
            product: { select: { name: true } }
        }
    });

    const sizeCounts: Record<string, number> = {};
    const productsBySize: Record<string, Set<string>> = {};

    for (const r of recipes) {
        const s = r.size === null ? 'NULL' : r.size;
        sizeCounts[s] = (sizeCounts[s] || 0) + 1;

        if (!productsBySize[s]) productsBySize[s] = new Set();
        productsBySize[s].add(r.product.name);
    }

    console.log("Reçete Tablosunda Kullanılan 'Boyut' (Size) İsimleri ve Rakamları:");
    for (const [s, count] of Object.entries(sizeCounts)) {
        console.log(`- "${s}": ${count} adet reçete kullanıyor.`);
        if (s === 'S' || s === 'M' || s === 'L') {
            console.log(`   !!! DİKKAT: Bunlar "S, M, L" olarak kaydedilmiş:`, Array.from(productsBySize[s]).slice(0, 5), '...');
        }
    }

}
main().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const renames = [
    // HOT (Karton)
    { from: 'Bardak: Sıcak küçük (8oz)', to: 'Karton Bardak: Small (8oz)' },
    { from: 'Bardak: Sıcak (14oz)', to: 'Karton Bardak: Medium (14oz)' },
    { from: 'Bardak: Sıcak (16oz)', to: 'Karton Bardak: Large (16oz)' },

    // COLD (Şeffaf)
    { from: 'Bardak: Şeffaf Small 12oz', to: 'Şeffaf Bardak: Small (12oz)' },
    { from: 'Orta Bardak (14oz)', to: 'Şeffaf Bardak: Medium (14oz)' },
    { from: 'Büyük Bardak (16oz)', to: 'Şeffaf Bardak: Large (16oz)' },
];

async function main() {
    console.log('--- Renaming Cup Ingredients for Consistency ---');

    for (const item of renames) {
        const ing = await prisma.ingredient.findFirst({ where: { name: item.from } });
        if (ing) {
            // Build update
            await prisma.ingredient.update({
                where: { id: ing.id },
                data: { name: item.to }
            });
            console.log(`✅ Renamed: '${item.from}' -> '${item.to}'`);
        } else {
            console.log(`⚠️ Source not found: '${item.from}' (Already renamed?)`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

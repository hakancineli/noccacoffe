// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper to escape CSV fields
const escapeCsv = (field) => {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

async function main() {
    console.log('📊 Generating Recipe Template CSV...');

    const products = await prisma.product.findMany({
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
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
    });

    // Define columns
    const headers = [
        'ID (DOKUNMAYIN)',
        'Kategori',
        'Ürün Adı',
        'Boyut (S/M/L veya Standart)',
        'Mevcut Reçete Durumu',
        'Hammadde 1', 'Miktar 1',
        'Hammadde 2', 'Miktar 2',
        'Hammadde 3', 'Miktar 3',
        'Hammadde 4', 'Miktar 4',
        'Hammadde 5', 'Miktar 5',
    ];

    const rows = [headers.join(',')];

    for (const p of products) {
        // Determine sizes to output
        let sizesToExport = ['Standart'];
        const sizedCategories = ['Soğuk Kahveler', 'Sıcak Kahveler', 'Frappeler', 'Bubble Tea', 'Milkshake', 'Matchalar'];

        if (sizedCategories.includes(p.category)) {
            sizesToExport = ['Small', 'Medium', 'Large'];
        }

        for (const size of sizesToExport) {
            const recipe = p.recipes.find(r => r.size === size || (size === 'Standart' && r.size === null));
            const hasRecipe = !!recipe;

            const rowData = [
                p.id,
                p.category,
                p.name,
                size,
                hasRecipe ? 'VAR' : 'YOK'
            ];

            // If recipe exists, fill existing ingredients
            if (recipe) {
                recipe.items.forEach(item => {
                    rowData.push(item.ingredient.name);
                    rowData.push(item.quantity.toString());
                });
            }

            // Pad remaining columns if less than 5 ingredients
            const currentFilled = recipe ? recipe.items.length * 2 : 0;
            const remainingSlots = 10 - currentFilled; // 5 ingredients * 2 columns
            for (let i = 0; i < remainingSlots; i++) {
                rowData.push('');
            }

            rows.push(rowData.map(escapeCsv).join(','));
        }
    }

    const outputPath = path.join(process.cwd(), 'urun_recete_sablonu.csv');

    // Add BOM for Excel compatibility with special chars (Turkish)
    const content = '\uFEFF' + rows.join('\n');
    fs.writeFileSync(outputPath, content, 'utf-8');

    console.log(`✅ CSV generated at: ${outputPath}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

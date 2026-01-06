const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Path to the CSV file (root of the project)
const CSV_PATH = path.resolve(process.cwd(), 'hammadde_stok_listesi.csv');

function parseNumber(value) {
    if (!value) return null;
    // Replace commas with dots and trim spaces
    const cleaned = value.replace(/,/g, '.').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

async function main() {
    const raw = fs.readFileSync(CSV_PATH, { encoding: 'utf-8' });
    const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);

    // First line is header, ignore it
    const dataLines = lines.slice(1);

    let created = 0;
    let updated = 0;

    for (const line of dataLines) {
        const cols = line.split(';');
        const name = cols[0]?.trim();
        const unit = cols[1]?.trim();
        const stock = parseNumber(cols[2]);
        const cost = parseNumber(cols[3]);
        // newStock and newCost are placeholders; we ignore them for now

        if (!name) continue;

        // Upsert ingredient
        const existing = await prisma.ingredient.findFirst({ where: { name } });
        if (existing) {
            await prisma.ingredient.update({
                where: { id: existing.id },
                data: {
                    unit: unit || existing.unit,
                    stock: stock !== null ? stock : existing.stock,
                    costPerUnit: cost !== null ? cost : existing.costPerUnit,
                },
            });
            updated++;
        } else {
            await prisma.ingredient.create({
                data: {
                    name,
                    unit: unit || 'adet',
                    stock: stock !== null ? stock : 0,
                    costPerUnit: cost !== null ? cost : 0,
                },
            });
            created++;
        }
    }

    console.log(`Import completed: ${created} created, ${updated} updated.`);
}

main()
    .catch(e => {
        console.error('Error during import:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

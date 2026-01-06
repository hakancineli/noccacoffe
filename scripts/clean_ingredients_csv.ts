import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    // 1. Get all ingredient names that are used in any recipe
    const usedItems = await prisma.recipeItem.findMany({
        select: { ingredient: { select: { name: true } } },
    });
    const usedSet = new Set(usedItems.map(i => i.ingredient.name.trim()));

    const csvPath = path.resolve(process.cwd(), 'hammadde_stok_listesi.csv');
    const raw = fs.readFileSync(csvPath, { encoding: 'utf-8' });
    const lines = raw.split(/\r?\n/);

    if (lines.length === 0) {
        console.error('CSV is empty');
        return;
    }

    const header = lines[0];
    const cleaned: string[] = [header];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // skip empty lines
        const cols = line.split(';');
        const name = cols[0]?.trim();
        if (!name) continue; // skip rows without a name
        if (!usedSet.has(name)) continue; // delete if not used in any recipe

        // Replace commas with dots for numeric columns (stock, cost per unit, new stock, new cost)
        const fixedCols = cols.map((c, idx) => {
            // columns 2 (unit) is text, keep as is
            // columns 3,4,5,6 are numbers possibly with commas
            if (idx >= 2 && idx <= 5) {
                return c.replace(/,/g, '.');
            }
            return c;
        });
        cleaned.push(fixedCols.join(';'));
    }

    const newContent = cleaned.join('\n');
    fs.writeFileSync(csvPath, newContent, { encoding: 'utf-8' });
    console.log('Cleaned CSV written, rows kept:', cleaned.length - 1);
}

main()
    .catch(e => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

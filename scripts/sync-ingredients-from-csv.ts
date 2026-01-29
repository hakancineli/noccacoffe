
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 CSV üzerinden hammadde güncelleme başlatılıyor...');

    const csvPath = path.join(process.cwd(), 'hammadde_stok_listesi.csv');
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    // Header is on line 2 (index 1), data starts from index 2
    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(';');
        if (columns.length < 4) continue;

        const name = columns[0].trim();
        const unit = columns[1].trim();
        const stockStr = columns[2].trim();
        const costStr = columns[3].trim();

        if (!name) continue;

        // Parse numbers (handle comma as decimal separator)
        const stock = parseFloat(stockStr.replace(',', '.')) || 0;
        const costPerUnit = parseFloat(costStr.replace(',', '.')) || 0;

        const existing = await prisma.ingredient.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } }
        });

        if (existing) {
            // Update if values are different
            const shouldUpdate =
                existing.unit !== unit ||
                Math.abs(existing.stock - stock) > 0.0001 ||
                Math.abs(existing.costPerUnit - costPerUnit) > 0.0001;

            if (shouldUpdate) {
                await prisma.ingredient.update({
                    where: { id: existing.id },
                    data: {
                        unit: unit || existing.unit,
                        stock: stock,
                        costPerUnit: costPerUnit
                    }
                });
                updated++;
                console.log(`✅ Güncellendi: ${name} (${existing.stock} -> ${stock})`);
            } else {
                skipped++;
            }
        } else {
            // Create new ingredient
            await prisma.ingredient.create({
                data: {
                    name,
                    unit: unit || 'adet',
                    stock,
                    costPerUnit
                }
            });
            created++;
            console.log(`🆕 Yeni Eklendi: ${name}`);
        }
    }

    console.log(`\n📊 Özet: ${created} yeni, ${updated} güncellendi, ${skipped} değişmedi.`);
}

main()
    .catch(e => console.error('❌ Hata:', e))
    .finally(() => prisma.$disconnect());

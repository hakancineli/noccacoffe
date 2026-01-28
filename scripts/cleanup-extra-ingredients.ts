
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 CSV dışındaki hammaddeler temizleniyor...\n');

    const csvPath = path.join(process.cwd(), 'hammadde_stok_listesi.csv');
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n');

    const validNames = new Set<string>();

    // Header is on line 2 (index 1), data starts from index 2
    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(';');
        if (columns.length < 1) continue;

        const name = columns[0].trim();
        if (name) {
            validNames.add(name.toLowerCase());
        }
    }

    console.log(`📋 CSV'de ${validNames.size} geçerli hammadde ismi bulundu.`);

    const allIngredients = await prisma.ingredient.findMany();
    console.log(`🗄️ Veritabanında ${allIngredients.length} hammadde kayıtlı.`);

    const toDelete = allIngredients.filter(ing => !validNames.has(ing.name.toLowerCase().trim()));

    if (toDelete.length === 0) {
        console.log('✅ Silinecek fazladan hammadde bulunamadı. Veritabanı liste ile zaten uyumlu.');
        return;
    }

    console.log(`⚠️ ${toDelete.length} adet fazla hammadde siliniyor:`);
    for (const ing of toDelete) {
        console.log(`   🗑️ Siliniyor: ${ing.name}`);
        await prisma.ingredient.delete({ where: { id: ing.id } });
    }

    console.log('\n✨ Temizlik tamamlandı!');
}

main()
    .catch(e => console.error('❌ Hata:', e))
    .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const today = new Date().toISOString().split('T')[0];
    const desktopPath = '/Users/hakancineli/Desktop';

    try {
        // Fetch Ingredients
        const ingredients = await prisma.ingredient.findMany({
            orderBy: { name: 'asc' }
        });

        const hammaddeCsvHeader = 'ID;Hammadde Adı;Birim;Mevcut Stok;Birim Maliyet (Girebilirsiniz)\n';
        const hammaddeCsvRows = ingredients.map(ing => {
            const stock = ing.stock.toString().replace('.', ',');
            const cost = (ing.costPerUnit || 0).toString().replace('.', ',');
            return `"${ing.id}";"${ing.name}";"${ing.unit}";${stock};${cost}`;
        }).join('\n');

        const hammaddeFileName = `${today}-Hammadde-Listesi.csv`;
        fs.writeFileSync(path.join(desktopPath, hammaddeFileName), '\ufeff' + hammaddeCsvHeader + hammaddeCsvRows);
        console.log(`Hammadde listesi oluşturuldu: ${hammaddeFileName}`);

        // Fetch Products
        const products = await prisma.product.findMany({
            orderBy: { category: 'asc' }
        });

        const urunCsvHeader = 'ID;Ürün Adı;Kategori;Mevcut Fiyat\n';
        const urunCsvRows = products.map(p => {
            const price = (p.price || 0).toString().replace('.', ',');
            return `"${p.id}";"${p.name}";"${p.category}";${price}`;
        }).join('\n');

        const urunFileName = `${today}-Urun-Listesi.csv`;
        fs.writeFileSync(path.join(desktopPath, urunFileName), '\ufeff' + urunCsvHeader + urunCsvRows);
        console.log(`Ürün listesi oluşturuldu: ${urunFileName}`);

        // Fetch Recipes
        const recipes = await prisma.recipe.findMany({
            include: {
                product: true,
                items: {
                    include: {
                        ingredient: true
                    }
                }
            },
            orderBy: [
                { product: { category: 'asc' } },
                { product: { name: 'asc' } }
            ]
        });

        const receteCsvHeader = 'Ürün ID;Ürün Adı;Boyut;Hammadde Adı;Miktar;Birim\n';
        let receteCsvRows = [];

        recipes.forEach(recipe => {
            recipe.items.forEach(item => {
                const quantity = item.quantity.toString().replace('.', ',');
                receteCsvRows.push(
                    `"${recipe.productId}";"${recipe.product.name}";"${recipe.size || 'Standart'}";"${item.ingredient.name}";${quantity};"${item.ingredient.unit}"`
                );
            });
        });

        const receteFileName = `${today}-Recete-Listesi.csv`;
        fs.writeFileSync(path.join(desktopPath, receteFileName), '\ufeff' + receteCsvHeader + receteCsvRows.join('\n'));
        console.log(`Reçete listesi oluşturuldu: ${receteFileName}`);

        console.log('\n--- İşlem Başarıyla Tamamlandı ---');
        console.log(`Dosyalar Masaüstüne kaydedildi: ${desktopPath}`);
    } catch (error) {
        console.error('Hata oluştu:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

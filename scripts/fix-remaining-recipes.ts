
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Kalan Eksik Reçeteler Düzeltiliyor...');

    // 1. Iced Filtre Kahve Fix
    const icedFiltre = await prisma.product.findFirst({ where: { name: 'Iced Filtre Kahve' } });
    const hotFiltre = await prisma.product.findFirst({
        where: { name: 'Filtre Kahve' },
        include: { recipes: { include: { items: true } } }
    });

    if (icedFiltre && hotFiltre && hotFiltre.recipes.length > 0) {
        console.log('✅ Iced Filtre Kahve -> Filtre Kahve üzerinden kopyalanıyor...');
        for (const hotRecipe of hotFiltre.recipes) {
            let cupName = 'Bardak: Şeffaf Medium';
            if (hotRecipe.size === 'Small' || hotRecipe.size === 'S') cupName = 'Bardak: Şeffaf Small';
            if (hotRecipe.size === 'Large' || hotRecipe.size === 'L') cupName = 'Bardak: Şeffaf Large';

            const cupIngredient = await prisma.ingredient.findFirst({
                where: { name: { contains: cupName, mode: 'insensitive' } }
            });

            const itemsToCopy = [];
            for (const item of hotRecipe.items) {
                const ing = await prisma.ingredient.findUnique({ where: { id: item.ingredientId } });
                if (ing && !ing.name.toLowerCase().includes('bardak')) {
                    itemsToCopy.push({ ingredientId: item.ingredientId, quantity: item.quantity });
                }
            }
            if (cupIngredient) itemsToCopy.push({ ingredientId: cupIngredient.id, quantity: 1 });

            await prisma.recipe.create({
                data: {
                    productId: icedFiltre.id,
                    size: hotRecipe.size,
                    items: { create: itemsToCopy }
                }
            });
        }
    }

    // 2. Cold Brew Fix
    const coldBrew = await prisma.product.findFirst({ where: { name: 'Cold Brew' } });
    if (coldBrew) {
        console.log('✅ Cold Brew için hammadde ve 1:1 reçete oluşturuluyor...');
        let coldBrewIng = await prisma.ingredient.findFirst({ where: { name: { contains: 'Cold Brew', mode: 'insensitive' } } });
        if (!coldBrewIng) {
            coldBrewIng = await prisma.ingredient.create({
                data: {
                    name: 'Cold Brew Konsantre',
                    unit: 'ml',
                    stock: 0,
                    costPerUnit: 0
                }
            });
        }

        const cupMedium = await prisma.ingredient.findFirst({ where: { name: 'Bardak: Şeffaf Medium' } });

        await prisma.recipe.create({
            data: {
                productId: coldBrew.id,
                size: null,
                items: {
                    create: [
                        { ingredientId: coldBrewIng.id, quantity: 200 }, // Varsayılan 200ml
                        { ingredientId: cupMedium?.id || '', quantity: 1 }
                    ].filter(i => i.ingredientId !== '')
                }
            }
        });
    }

    console.log('✨ Tüm eksikler tamamlandı!');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mapping: Ingredient Name (from Excel) -> Product Name (in DB)
const productMapping = {
    'Meşrubat: Coca Cola': 'Coca Cola',
    'Meşrubat: Cola Turka': 'Kola Turka',
    'Meşrubat: Su': 'Su',
    'Meşrubat: Sade Soda': 'Sade Soda',
    'Meşrubat: Limonlu Soda': 'Limonlu Soda',
    'Meşrubat : çobanpınar': 'Su', // Fallback or separate product? Assuming it maps to possibly Su or a new one. Let's check db later.
};

async function main() {
    console.log('--- STARTING FIX ---');

    // 1. FIX MANGO PUREE
    // Find the one from Excel (has stock)
    const excelMango = await prisma.ingredient.findFirst({
        where: { name: 'Püre: Mango' }
    });
    // Find the original system one
    const systemMango = await prisma.ingredient.findFirst({
        where: { name: 'Mango Püresi' }
    });

    if (excelMango && systemMango) {
        console.log(`Fixing Mango: Transferring stock ${excelMango.stock} from '${excelMango.name}' to '${systemMango.name}'`);
        await prisma.ingredient.update({
            where: { id: systemMango.id },
            data: {
                stock: excelMango.stock,
                costPerUnit: excelMango.costPerUnit, // Copy cost too
                unit: excelMango.unit
            }
        });
        // Delete the duplicate
        try {
            await prisma.ingredient.delete({ where: { id: excelMango.id } });
            console.log('Deleted duplicate Mango ingredient.');
        } catch (e) {
            console.log('Could not delete duplicate mango (maybe used in recipe?):', e.message);
        }
    } else if (excelMango && !systemMango) {
        // Just rename it to match system convention if needed, or leave it.
        // But since recipe uses 'Mango Püresi' likely, we should rename it if recipe exists.
        // Let's assume we just leave it for now or rename.
        console.log('Only Excel Mango found. Renaming to Mango Püresi for consistency.');
        await prisma.ingredient.update({
            where: { id: excelMango.id },
            data: { name: 'Mango Püresi' }
        });
    }

    // 2. FIX COCA COLA DUPLICATE INGREDIENT
    const duplicateCoke = await prisma.ingredient.findFirst({
        where: { name: 'Coca Cola', stock: 0 }
    });
    if (duplicateCoke) {
        // Check if used in recipe
        const usage = await prisma.recipeItem.count({ where: { ingredientId: duplicateCoke.id } });
        if (usage === 0) {
            await prisma.ingredient.delete({ where: { id: duplicateCoke.id } });
            console.log('Deleted unused duplicate ingredient: Coca Cola');
        } else {
            console.log('Duplicate "Coca Cola" ingredient is used in recipes, cannot delete safely. Please merge manually.');
        }
    }

    // 3. TRANSFER STOCKS TO PRODUCTS (For POS Availability)
    for (const [ingName, prodName] of Object.entries(productMapping)) {
        const ingredient = await prisma.ingredient.findFirst({
            where: { name: { contains: ingName, mode: 'insensitive' } } // Use contains to match loosely
        });

        if (ingredient) {
            const product = await prisma.product.findFirst({
                where: { name: prodName }
            });

            if (product) {
                console.log(`Updating Product '${product.name}' stock to ${ingredient.stock} (from '${ingredient.name}')`);
                await prisma.product.update({
                    where: { id: product.id },
                    data: { stock: Math.floor(ingredient.stock) } // Products usually integer stock
                });
            } else {
                console.log(`Product '${prodName}' not found.`);
            }
        } else {
            console.log(`Ingredient '${ingName}' not found.`);
        }
    }

    console.log('--- FIX COMPLETED ---');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

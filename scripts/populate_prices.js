// scripts/populate_prices.js
// Populate the `prices` JSON field for existing products based on static menuItems data.
const path = require('path');
const { prisma } = require(path.join(__dirname, '..', 'src', 'lib', 'prisma'));
const { allMenuItems } = require(path.join(__dirname, '..', 'src', 'data', 'menuItems'));

async function main() {
    for (const menuItem of allMenuItems) {
        if (menuItem.sizes && menuItem.sizes.length > 0) {
            // Find product by name (assuming names are unique)
            const product = await prisma.product.findUnique({ where: { name: menuItem.name } });
            if (product) {
                const prices = menuItem.sizes.map(s => ({ size: s.size, price: s.price }));
                await prisma.product.update({
                    where: { id: product.id },
                    data: { prices },
                });
                console.log(`Updated prices for ${product.name}`);
            }
        }
    }
}

main()
    .catch(e => {
        console.error('Error populating prices:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

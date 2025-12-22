import { PrismaClient } from '@prisma/client';
import { allMenuItems } from '../src/data/menuItems';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setup() {
    console.log('--- Starting Comprehensive Data Restoration ---');

    // 1. Staff & Admin Accounts
    console.log('Restoring accounts...');
    const staffMembers = [
        { name: 'Hakan Cineli', email: 'hakancineli@gmail.com', role: 'MANAGER', password: 'Hakan123!' },
        { name: 'Admin User', email: 'admin@noccacoffee.com', role: 'MANAGER', password: 'password' },
        { name: 'Ceren Alper', email: 'ceren@noccacoffee.com', role: 'MANAGER', password: '123' },
        { name: 'Can Tecirli', email: 'can@noccacoffee.com', role: 'MANAGER', password: '123' },
        { name: 'Kasa Personeli', email: 'kasa@noccacoffee.com', role: 'BARISTA', password: '123' },
        { name: 'Mutfak Ekranı', email: 'kitchen@noccacoffee.com', role: 'BARISTA', password: 'kitchen' }
    ];

    for (const member of staffMembers) {
        const passwordHash = await bcrypt.hash(member.password, 10);
        await prisma.barista.upsert({
            where: { email: member.email },
            update: { passwordHash, role: member.role as any, isActive: true },
            create: {
                name: member.name,
                email: member.email,
                passwordHash,
                role: member.role as any,
                isActive: true,
                startDate: new Date()
            }
        });
    }
    console.log('✅ Accounts restored.');

    // 2. Ingredients (Raw Materials / Hammaddeler)
    console.log('Restoring ingredients...');

    // 2a. Basic Base Ingredients
    const baseIngredients = [
        { id: 'ing-espresso', name: 'Espresso Çekirdeği', unit: 'g', stock: 5000, cost: 0.6 },
        { id: 'ing-filtre', name: 'Filtre Kahve Çekirdeği', unit: 'g', stock: 5000, cost: 0.5 },
        { id: 'ing-turk', name: 'Türk Kahvesi Çekirdeği', unit: 'g', stock: 5000, cost: 0.4 },
        { id: 'ing-sut', name: 'Normal Süt', unit: 'ml', stock: 20000, cost: 0.04 },
        { id: 'ing-cup-s', name: 'Küçük Bardak (8oz)', unit: 'adet', stock: 1000, cost: 2 },
        { id: 'ing-cup-m', name: 'Orta Bardak (12oz)', unit: 'adet', stock: 1000, cost: 2.5 },
        { id: 'ing-cup-l', name: 'Büyük Bardak (16oz)', unit: 'adet', stock: 1000, cost: 3 },
        { id: 'ing-iced-cup', name: 'Soğuk İçecek Bardağı', unit: 'adet', stock: 1000, cost: 3 }
    ];

    for (const ing of baseIngredients) {
        await prisma.ingredient.upsert({
            where: { id: ing.id },
            update: { name: ing.name, unit: ing.unit, costPerUnit: ing.cost, stock: ing.stock },
            create: { id: ing.id, name: ing.name, unit: ing.unit, costPerUnit: ing.cost, stock: ing.stock }
        });
    }

    // 2b. Dynamic Ingredients from Product Categories (Syrups, Sauces, etc.)
    const rawMaterialCategories = ['Şuruplar', 'Soslar', 'Püreler', 'Tozlar', 'Sütler', 'Meşrubatlar', 'Bitki Çayları'];
    for (const item of allMenuItems) {
        if (rawMaterialCategories.includes(item.category)) {
            if (item.name === 'Normal Süt') continue; // Skip to avoid duplicate with base ingredient

            const unit = (item.category === 'Meşrubatlar' || item.category === 'Bitki Çayları') ? 'adet' : 'ml';
            const cost = item.price ? (typeof item.price === 'number' ? item.price * 0.4 : 10) : 10;

            await prisma.ingredient.upsert({
                where: { id: `ing-${item.id}` },
                update: { name: item.name, unit, costPerUnit: cost },
                create: {
                    id: `ing-${item.id}`,
                    name: item.name,
                    unit,
                    stock: 50, // Default stock for raw materials
                    costPerUnit: cost
                }
            });
        }
    }
    console.log('✅ All raw material ingredients (Hammaddeler) restored.');

    // 3. Sync Full Product Catalog
    console.log('Syncing products from menuItems.ts...');
    for (const item of allMenuItems) {
        let price = 0;
        if (item.price) {
            price = typeof item.price === 'string'
                ? parseFloat(String(item.price).replace('₺', '').replace(',', '.'))
                : item.price;
        } else if (item.sizes && item.sizes.length > 0) {
            price = item.sizes[0].price;
        }

        // Custom Overrides
        if (item.name === 'Latte' && item.category === 'Sıcak Kahveler') price = 100;
        if (item.name === 'Americano' && item.category === 'Sıcak Kahveler') price = 90;
        if (item.name === 'Double Espresso') price = 80;

        await prisma.product.upsert({
            where: { id: item.id.toString() },
            update: { name: item.name, category: item.category, price: price, imageUrl: item.image, isActive: true },
            create: {
                id: item.id.toString(),
                name: item.name,
                description: item.description,
                category: item.category,
                price: price,
                imageUrl: item.image,
                isActive: true,
                stock: 0
            }
        });
    }

    // Custom Syrups & Extras
    const customItems = [
        { id: 'custom-buzlu-bardak', name: 'Buzlu Bardak', category: 'Extra', price: 10 },
        { id: 'custom-syrup-toffinat', name: 'Toffinat', category: 'Syrups', price: 25 },
        { id: 'custom-syrup-hazelnut', name: 'Hazelnut', category: 'Syrups', price: 25 },
        { id: 'custom-syrup-cookie', name: 'Cookie', category: 'Syrups', price: 25 },
        { id: 'custom-syrup-mint', name: 'Mint', category: 'Syrups', price: 25 }
    ];

    for (const p of customItems) {
        await prisma.product.upsert({
            where: { id: p.id },
            update: { ...p },
            create: { ...p, stock: 0, isActive: true }
        });
    }
    console.log('✅ Products synced.');

    console.log('--- Restoration Complete ---');
}

setup()
    .catch((e) => {
        console.error('Error during restoration:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

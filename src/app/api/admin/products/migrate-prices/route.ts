
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { allMenuItems } from '@/data/menuItems';

export async function POST() {
    try {
        const results = [];

        // Get all products from DB
        const dbProducts = await prisma.product.findMany();

        for (const dbProduct of dbProducts) {
            // Find matching item in static data
            const staticItem = allMenuItems.find(m => m.name === dbProduct.name);

            if (staticItem && staticItem.sizes && staticItem.sizes.length > 0) {
                // Update DB product with sizes
                await prisma.product.update({
                    where: { id: dbProduct.id },
                    data: {
                        prices: staticItem.sizes // This stores as JSON
                    }
                });
                results.push({ name: dbProduct.name, status: 'updated', sizes: staticItem.sizes.length });
            } else {
                results.push({ name: dbProduct.name, status: 'skipped (no sizes)' });
            }
        }

        return NextResponse.json({
            message: 'Migration completed',
            total: dbProducts.length,
            updated: results.filter(r => r.status === 'updated').length,
            details: results
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
    }
}

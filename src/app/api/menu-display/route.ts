import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

// Categories to hide from public menu display (technical/ingredient categories)
const HIDDEN_CATEGORIES = ['Şuruplar', 'Soslar', 'Püreler', 'Tozlar', 'Sütler', 'Extra', 'Kahve Çekirdekleri'];

// Category display order
const CATEGORY_ORDER = [
    'Espresso VE Türk Kahvesi',
    'Sıcak Kahveler',
    'Soğuk Kahveler',
    'Frappeler',
    'Matchalar',
    'Milkshake',
    'Bubble Tea',
    'Soğuk İçecekler',
    'Çaylar',
    'Meşrubatlar',
    'Tatlılar',
    'Yan Ürünler'
];

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                category: { notIn: HIDDEN_CATEGORIES }
            },
            select: {
                id: true,
                name: true,
                category: true,
                price: true,
                prices: true,
                imageUrl: true
            },
            orderBy: { name: 'asc' }
        });

        // Group by category
        const grouped: { [key: string]: typeof products } = {};

        for (const product of products) {
            if (!grouped[product.category]) {
                grouped[product.category] = [];
            }
            grouped[product.category].push(product);
        }

        // Sort categories by predefined order
        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            const aIndex = CATEGORY_ORDER.indexOf(a);
            const bIndex = CATEGORY_ORDER.indexOf(b);
            if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });

        const result = sortedCategories.map(category => ({
            category,
            products: grouped[category]
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Menu display fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
    }
}

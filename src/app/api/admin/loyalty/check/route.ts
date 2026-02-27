import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { pin } = body;

        if (!pin || pin.length !== 4) {
            return NextResponse.json({ error: 'Geçersiz PIN' }, { status: 400 });
        }

        // 1. Get Campaign Settings
        const settings = await prisma.systemSettings.findUnique({
            where: { id: 'default' }
        });

        if (!settings || !settings.loyaltyCampaignActive) {
            return NextResponse.json({
                eligible: false,
                message: 'Sadakat kampanyası şu anda aktif değil.'
            });
        }

        // 2. Find User by PIN
        const user = await prisma.user.findUnique({
            where: { loyaltyPin: pin },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
            }
        });

        if (!user) {
            return NextResponse.json({
                eligible: false,
                message: 'Bu PIN koduna ait kullanıcı bulunamadı.'
            });
        }

        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

        // 3. Check for today's orders
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const lastOrder = await prisma.order.findFirst({
            where: {
                userId: user.id,
                createdAt: { gte: startOfDay },
                status: 'COMPLETED'
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!lastOrder) {
            return NextResponse.json({
                eligible: false,
                user,
                message: `Hoş geldiniz ${fullName}! Bugünün ilk alımı için indirim hakkınız bulunmuyor.`
            });
        }

        // Find the qualifying drink price from the last order
        const nonBeverageCategories = ['Tatlılar', 'Tozlar', 'Ekstralar', 'Yan Ürünler', 'Atıştırmalıklar'];
        const drinks = lastOrder.orderItems.filter(item =>
            item.product && !nonBeverageCategories.includes(item.product.category)
        );

        // Use the highest unit price among beverages in that order as our reference for "1st drink"
        const lastDrinkPrice = drinks.length > 0
            ? Math.max(...drinks.map(d => d.unitPrice))
            : 0;

        // 4. Check Cooldown (1 hour) and Window (12 hours)
        const orderTime = new Date(lastOrder.createdAt);
        const diffMs = now.getTime() - orderTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 1) {
            const remainingMinutes = Math.ceil(60 - (diffMs / (1000 * 60)));
            return NextResponse.json({
                eligible: false,
                isCooldown: true,
                user,
                remainingMinutes,
                message: `Hoş geldiniz ${fullName}! İndirim hakkınız için son ${remainingMinutes} dakikanız, beklemeye değer!`
            });
        }

        if (diffHours > 12) {
            return NextResponse.json({
                eligible: false,
                user,
                message: `Hoş geldiniz ${fullName}! Son siparişinizin üzerinden 12 saat geçmiş, yeni bir hak için ilk alımınızı yapmanız gerekiyor.`
            });
        }

        // 5. Eligible!
        return NextResponse.json({
            eligible: true,
            user,
            discountRate: settings.loyaltyDiscountRate,
            lastDrinkPrice: lastDrinkPrice,
            hasLoyaltyDiscount: (lastOrder.discountAmount || 0) > 0, // Inform frontend if last order was already a discounted one
            message: `Hoş geldiniz ${fullName}! Bugünün 2. kahvesi bizden, %${settings.loyaltyDiscountRate} indiriminiz hazır!`
        });

    } catch (error) {
        console.error('Loyalty check error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

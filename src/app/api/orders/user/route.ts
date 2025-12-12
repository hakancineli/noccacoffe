import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate User
        let token = request.cookies.get('auth-token')?.value;

        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return NextResponse.json(
                { error: 'Oturum bulunamadı' },
                { status: 401 }
            );
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
        } catch (err) {
            return NextResponse.json(
                { error: 'Geçersiz oturum' },
                { status: 401 }
            );
        }

        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Geçersiz kullanıcı' },
                { status: 401 }
            );
        }

        // 2. Fetch User's Orders
        const orders = await prisma.order.findMany({
            where: {
                userId: decoded.userId
            },
            include: {
                orderItems: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform data to match frontend expectations if necessary
        const transformedOrders = orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            date: new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            status: order.status.toLowerCase(), // frontend expects lowercase
            total: order.totalAmount, // or finalAmount
            items: order.orderItems.map(item => ({
                id: item.productId, // Frontend uses this key
                name: item.productName,
                quantity: item.quantity,
                price: item.unitPrice,
                image: '/images/logo/noccacoffee.jpeg', // Fallback or fetch from product relation if needed. 
                // Note: OrderItem doesn't store image url, and we are not including Product relation here.
                // Let's stick to a fallback for now or include Product to get image.
            })),
            paymentMethod: order.paymentMethod || 'Kredi Kartı', // Default/Fallback
            storeLocation: 'Yenibosna Yıldırım Beyazıt Cad. 84/A' // Hardcoded for now as it's not in DB
        }));

        return NextResponse.json(transformedOrders);

    } catch (error) {
        console.error('Failed to fetch user orders:', error);
        return NextResponse.json(
            { error: 'Siparişler getirilemedi' },
            { status: 500 }
        );
    }
}

'use client';

import { CartProvider } from '@/contexts/CartContext';
import CartSidebar from './CartSidebar';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            {children}
            <CartSidebar />
        </CartProvider>
    );
}

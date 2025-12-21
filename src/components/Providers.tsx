'use client';

import { CartProvider } from '@/contexts/CartContext';
import CartSidebar from './CartSidebar';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            {children}
            <CartSidebar />
            <Toaster position="top-right" />
        </CartProvider>
    );
}

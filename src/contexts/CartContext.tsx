'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '@/data/menuItems';

export interface CartItem extends MenuItem {
    selectedSize?: string;
    quantity: number;
    finalPrice: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: MenuItem, size?: string) => void;
    removeFromCart: (itemId: number, size?: string) => void;
    updateQuantity: (itemId: number, quantity: number, size?: string) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart JSON', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addToCart = (product: MenuItem, size?: string) => {
        let price = product.price || 0;

        // Find price based on size if selected
        if (size && product.sizes) {
            const sizeOption = product.sizes.find(s => s.size === size);
            if (sizeOption) {
                price = sizeOption.price;
            }
        }

        setItems(prevItems => {
            // Check if item already exists with same id and size
            const existingItemIndex = prevItems.findIndex(
                item => item.id === product.id && item.selectedSize === size
            );

            if (existingItemIndex > -1) {
                // Item exists, increase quantity
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += 1;
                return newItems;
            } else {
                // New item
                return [...prevItems, {
                    ...product,
                    selectedSize: size,
                    quantity: 1,
                    finalPrice: price
                }];
            }
        });

        // Open cart when adding item
        setIsCartOpen(true);
    };

    const removeFromCart = (itemId: number, size?: string) => {
        setItems(prevItems =>
            prevItems.filter(item => !(item.id === itemId && item.selectedSize === size))
        );
    };

    const updateQuantity = (itemId: number, quantity: number, size?: string) => {
        if (quantity < 1) {
            removeFromCart(itemId, size);
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                (item.id === itemId && item.selectedSize === size)
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    const totalPrice = items.reduce((total, item) => {
        return total + (item.finalPrice * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

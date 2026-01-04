'use client';

import { useEffect } from 'react';

export default function ThemeInitializer() {
    useEffect(() => {
        // Run on mount to ensure theme is applied
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    return null; // This component doesn't render anything
}

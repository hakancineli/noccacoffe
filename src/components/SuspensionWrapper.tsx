'use client';

import React, { useState, useEffect } from 'react';
import LicenseSuspended from './LicenseSuspended';

const SUSPENSION_TIME = new Date('2026-03-07T18:00:00+03:00').getTime();

export default function SuspensionWrapper({ children }: { children: React.ReactNode }) {
    const [isSuspended, setIsSuspended] = useState(false);

    useEffect(() => {
        const checkSuspension = () => {
            const now = new Date().getTime();
            if (now >= SUSPENSION_TIME) {
                setIsSuspended(true);
            }
        };

        checkSuspension();
        const interval = setInterval(checkSuspension, 60000);
        return () => clearInterval(interval);
    }, []);

    if (isSuspended) {
        return <LicenseSuspended />;
    }

    return <>{children}</>;
}

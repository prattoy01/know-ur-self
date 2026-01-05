'use client';

import { useEffect, useState } from 'react';

type RatingToastProps = {
    change: number;
    onClose: () => void;
};

export default function RatingToast({ change, onClose }: RatingToastProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for fade out
        }, 2500);

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!visible) return null;

    const isPositive = change > 0;
    const bgColor = isPositive ? 'bg-green-500' : 'bg-red-500';
    const icon = isPositive ? '↗️' : '↘️';

    return (
        <div className={`fixed top-24 right-6 z-50 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl animate-fade-in flex items-center gap-3`}>
            <span className="text-3xl">{icon}</span>
            <div>
                <div className="font-bold text-lg">
                    {isPositive ? '+' : ''}{change} Rating
                </div>
                <div className="text-sm opacity-90">
                    {isPositive ? 'Great work!' : 'Penalty applied'}
                </div>
            </div>
        </div>
    );
}

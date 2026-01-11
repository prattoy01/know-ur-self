import React from 'react';
import CountdownTimer from '../../components/CountdownTimer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FocusPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center relative p-4">

            <div className="absolute top-6 left-6">
                <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Dashboard</span>
                </Link>
            </div>

            <div className="w-full max-w-2xl flex flex-col items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Focus Session</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-10 text-center">
                    Eliminate distractions and focus on your task.
                </p>

                <CountdownTimer initialMinutes={25} color="amber" />
            </div>

        </div>
    );
}

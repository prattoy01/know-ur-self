'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [msg, setMsg] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMsg('No token provided.');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });
                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMsg('Email verified successfully! Redirecting to login...');
                    setTimeout(() => router.push('/login'), 2000);
                } else {
                    setStatus('error');
                    setMsg(data.error || 'Verification failed');
                }
            } catch (err) {
                setStatus('error');
                setMsg('Something went wrong.');
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="w-full max-w-md bg-white dark:bg-[#161b22] rounded-2xl shadow-xl p-8 text-center space-y-6 animate-fade-in border border-gray-200 dark:border-gray-800">
            <div className="text-6xl mb-4">
                {status === 'verifying' && '⏳'}
                {status === 'success' && '✅'}
                {status === 'error' && '❌'}
            </div>

            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {status === 'verifying' && 'Verifying...'}
                {status === 'success' && 'Verified!'}
                {status === 'error' && 'Verification Failed'}
            </h1>

            <p className="text-gray-600 dark:text-gray-400">
                {msg}
            </p>

            {status === 'error' && (
                <Link href="/login" className="inline-block mt-4 text-blue-600 hover:underline">
                    Back to Login
                </Link>
            )}
        </div>
    );
}

function VerifyFallback() {
    return (
        <div className="w-full max-w-md bg-white dark:bg-[#161b22] rounded-2xl shadow-xl p-8 text-center space-y-6 animate-fade-in border border-gray-200 dark:border-gray-800">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Loading...</h1>
            <p className="text-gray-600 dark:text-gray-400">Please wait...</p>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-[#0f1115]">
            <Suspense fallback={<VerifyFallback />}>
                <VerifyContent />
            </Suspense>
        </div>
    );
}

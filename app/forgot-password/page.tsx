'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // TODO: Implement password reset API
            // const res = await fetch('/api/auth/forgot-password', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email }),
            // });

            // Placeholder: simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                        ✓
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Check Your Email</h1>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We've sent password reset instructions to <span className="font-semibold text-gray-800">{email}</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        Didn't receive the email? Check your spam folder or try again.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10">
                {/* Icon */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl inline-flex items-center justify-center text-white text-3xl mb-5">
                        🔐
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">Forgot Password?</h1>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        No worries! Enter your email and we'll send you<br />
                        instructions to reset your password.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 pr-12 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-blue-500 bg-white"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">📧</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-base font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 mb-5"
                    >
                        Send Reset Link
                    </button>

                    <div className="text-center">
                        <Link href="/login" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                            ← Back to Login
                        </Link>
                    </div>
                </form>

                {/* Additional Help */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500">
                        Need more help? <a href="#" className="text-blue-500 font-medium hover:underline">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

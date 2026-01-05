'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex min-h-screen overflow-hidden">
            {/* Left Panel - Onboarding */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center p-16 overflow-hidden bg-gradient-to-br from-purple-600 to-purple-500">
                {/* Decorative Animated Shapes */}
                <div className="absolute inset-0 w-full h-full">
                    <div className="absolute top-[15%] left-[10%] w-10 h-10 rounded-full bg-pink-400 opacity-60 animate-[float_6s_ease-in-out_infinite]"></div>
                    <div className="absolute top-[20%] left-[50%] w-8 h-8 rounded-full bg-yellow-300 opacity-60 animate-[float_5s_ease-in-out_infinite_1s]"></div>
                    <div className="absolute top-[30%] right-[25%] w-9 h-9 rounded-full bg-blue-400 opacity-60 animate-[float_7s_ease-in-out_infinite_2s]"></div>
                    <div className="absolute top-[40%] right-[10%] w-6 h-6 rounded-full bg-green-400 opacity-60 animate-[float_5.5s_ease-in-out_infinite_0.5s]"></div>
                    <div className="absolute bottom-[25%] left-[15%] w-8 h-8 rounded-full bg-orange-400 opacity-60 animate-[float_6.5s_ease-in-out_infinite_1.5s]"></div>
                    <div className="absolute bottom-[30%] right-[20%] w-9 h-9 rounded-full bg-cyan-300 opacity-60 animate-[float_6s_ease-in-out_infinite_0.8s]"></div>
                </div>

                {/* Carousel Content */}
                <div className="relative z-10 text-center max-w-lg">
                    <div className="bg-white/15 backdrop-blur-md rounded-3xl p-10 mb-10 shadow-2xl">
                        <div className="relative mb-8">
                            {/* Productivity Cards */}
                            <div className="bg-white rounded-2xl p-5 shadow-xl text-left max-w-[280px] mx-auto mb-5 rotate-6">
                                <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl mb-4 flex items-center justify-center text-5xl">
                                    📊
                                </div>
                                <div className="text-sm font-semibold text-gray-800 mb-2">Track Your Progress</div>
                                <div className="text-xs text-gray-500 leading-relaxed">
                                    1. Daily activity tracking<br />
                                    2. Study plan management<br />
                                    3. Budget & finance goals
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="bg-white rounded-2xl p-4 shadow-xl -rotate-6 max-w-[280px] mx-auto space-y-3">
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl flex-shrink-0">⭐</div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800">Level Up</div>
                                        <div className="text-gray-400 text-[10px]">Earn points daily</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">🎯</div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800">Goal Crusher</div>
                                        <div className="text-gray-400 text-[10px]">Complete challenges</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">💎</div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800">Consistency King</div>
                                        <div className="text-gray-400 text-[10px]">Build streaks</div>
                                    </div>
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="inline-flex items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-lg text-sm text-gray-800 mt-3">
                                <span className="text-purple-500 text-base">✨</span>
                                <span>Start your journey today</span>
                            </div>
                        </div>

                        <h2 className="text-white text-3xl font-bold mb-4">Build Productive Habits</h2>
                        <p className="text-white/90 text-base leading-relaxed">Track time, manage finances, and level up your productivity game.</p>
                    </div>

                    {/* Carousel Dots */}
                    <div className="flex gap-2 justify-center">
                        <div className="w-6 h-2 rounded bg-white"></div>
                        <div className="w-2 h-2 rounded-full bg-white/40"></div>
                        <div className="w-2 h-2 rounded-full bg-white/40"></div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-4 sm:p-8 lg:p-16 overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-purple-500 rounded-2xl inline-flex items-center justify-center text-white text-3xl mb-5">
                            🚀
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-3">Create Account</h1>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Join thousands of users building better habits<br />
                            and achieving their goals every day
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Name Input */}
                        <div className="mb-5">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Display Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 pr-12 py-4 border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-purple-500 bg-white"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">👤</span>
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="mb-5">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 pr-12 py-4 border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-purple-500 bg-white"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">@</span>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="mb-6">
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 pr-12 py-4 border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-purple-500 bg-white"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔒</span>
                            </div>
                        </div>

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-purple-500 text-white rounded-xl text-base font-semibold transition-all duration-300 hover:bg-purple-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/40 mb-5"
                        >
                            Sign Up
                        </button>

                        {/* Divider */}
                        <div className="relative text-center text-gray-400 text-sm my-6">
                            <span className="relative z-10 bg-gray-50 px-4">Or</span>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200"></div>
                        </div>

                        {/* Google Sign Up */}
                        <button
                            type="button"
                            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                            className="w-full py-4 bg-white border-2 border-gray-200 rounded-xl text-base font-medium text-gray-800 transition-all duration-300 hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center gap-3 mb-3"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" />
                                <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" />
                                <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" />
                                <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" />
                            </svg>
                            Sign up with Google
                        </button>

                        {/* GitHub Sign Up */}
                        <button
                            type="button"
                            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                            className="w-full py-4 bg-gray-900 border-2 border-gray-800 rounded-xl text-base font-medium text-white transition-all duration-300 hover:bg-gray-800 flex items-center justify-center gap-3"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.167 20 14.418 20 10c0-5.523-4.477-10-10-10z" />
                            </svg>
                            Sign up with GitHub
                        </button>

                        {/* Login Link */}
                        <div className="text-center mt-8 text-gray-600 text-sm">
                            Already have an account? <Link href="/login" className="text-purple-500 font-semibold hover:underline">Login</Link>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    50% { transform: translateY(-20px) translateX(10px); }
                }
            `}</style>
        </div>
    );
}

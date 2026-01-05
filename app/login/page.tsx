'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Redirect based on callbackUrl or portfolio status
            const params = new URLSearchParams(window.location.search);
            const callbackUrl = params.get('callbackUrl');

            if (callbackUrl) {
                router.push(callbackUrl);
            } else if (data.portfolioComplete === false) {
                router.push('/onboarding');
            } else {
                router.push('/dashboard');
            }
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Left Panel - Productivity Themed Onboarding */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center p-16 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
                {/* Decorative Animated Shapes */}
                <div className="absolute inset-0 w-full h-full">
                    <div className="absolute top-[15%] left-[10%] w-10 h-10 rounded-full bg-orange-400 opacity-60 animate-[float_6s_ease-in-out_infinite]"></div>
                    <div className="absolute top-[20%] left-[50%] w-8 h-8 rounded-full bg-yellow-300 opacity-60 animate-[float_5s_ease-in-out_infinite_1s]"></div>
                    <div className="absolute top-[30%] right-[25%] w-9 h-9 rounded-full bg-pink-400 opacity-60 animate-[float_7s_ease-in-out_infinite_2s]"></div>
                    <div className="absolute top-[40%] right-[10%] w-6 h-6 rounded-full bg-green-400 opacity-60 animate-[float_5.5s_ease-in-out_infinite_0.5s]"></div>
                    <div className="absolute bottom-[25%] left-[15%] w-8 h-8 rounded-full bg-cyan-300 opacity-60 animate-[float_6.5s_ease-in-out_infinite_1.5s]"></div>
                    <div className="absolute bottom-[30%] right-[20%] w-9 h-9 rounded-full bg-rose-300 opacity-60 animate-[float_6s_ease-in-out_infinite_0.8s]"></div>
                </div>

                {/* Carousel Content */}
                <div className="relative z-10 text-center max-w-lg">
                    <div className="bg-white/15 backdrop-blur-md rounded-3xl p-10 mb-10 shadow-2xl">
                        <div className="relative mb-8">
                            {/* Productivity Illustration */}
                            <div className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl p-8 shadow-xl text-left max-w-[320px] mx-auto mb-5 relative overflow-hidden">
                                {/* Running Person on Gears */}
                                <div className="relative h-48 flex items-center justify-center">
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32">
                                        <div className="w-full h-full rounded-full border-8 border-orange-400 flex items-center justify-center text-4xl animate-[spin_20s_linear_infinite]">
                                            ⚙️
                                        </div>
                                    </div>
                                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-6xl animate-bounce">
                                        🏃
                                    </div>
                                    <div className="absolute top-0 left-6 text-3xl animate-pulse">📊</div>
                                    <div className="absolute top-4 right-6 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>🎯</div>
                                    <div className="absolute bottom-4 left-8 text-2xl animate-pulse" style={{ animationDelay: '1s' }}>⏰</div>
                                </div>
                                <div className="text-center mt-4">
                                    <div className="text-sm font-semibold text-gray-800">Keep Moving Forward</div>
                                    <div className="text-xs text-gray-600 mt-1">Your productivity journey starts here</div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="bg-white rounded-2xl p-4 shadow-xl rotate-3 max-w-[280px] mx-auto space-y-3">
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">📈</div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800">Track Progress</div>
                                        <div className="text-gray-400 text-[10px]">Monitor daily activities</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl flex-shrink-0">💰</div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800">Manage Budget</div>
                                        <div className="text-gray-400 text-[10px]">Control your finances</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">🎮</div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800">Gamify Goals</div>
                                        <div className="text-gray-400 text-[10px]">Level up your life</div>
                                    </div>
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="inline-flex items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-lg text-sm text-gray-800 mt-3">
                                <span className="text-blue-500 text-base">⚡</span>
                                <span>Achieve more every day</span>
                            </div>
                        </div>

                        <h2 className="text-white text-3xl font-bold mb-4">Your Productivity Command Center</h2>
                        <p className="text-white/90 text-base leading-relaxed">Track time, crush goals, and transform your daily habits into extraordinary achievements.</p>
                    </div>

                    {/* Carousel Dots */}
                    <div className="flex gap-2 justify-center">
                        <div className="w-6 h-2 rounded bg-white"></div>
                        <div className="w-2 h-2 rounded-full bg-white/40"></div>
                        <div className="w-2 h-2 rounded-full bg-white/40"></div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-16">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl inline-flex items-center justify-center text-white text-3xl mb-5">
                            ⚡
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-3">Welcome Back!</h1>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Sign in to continue your productivity journey<br />
                            and unlock your full potential
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className="mb-5">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 pr-12 py-4 border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-blue-500 bg-white"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">@</span>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="mb-5">
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 pr-12 py-4 border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-blue-500 bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                            <line x1="2" x2="22" y1="2" y2="22" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Form Footer */}
                        <div className="flex justify-between items-center mb-6 text-sm">
                            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <span>Remember Me</span>
                            </label>
                            <Link href="/forgot-password" className="text-blue-500 font-medium hover:underline">Forgot Password?</Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-base font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 mb-5"
                        >
                            Login
                        </button>

                        {/* Divider */}
                        <div className="relative text-center text-gray-400 text-sm my-6">
                            <span className="relative z-10 bg-gray-50 px-4">Or</span>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200"></div>
                        </div>

                        {/* Google Sign In */}
                        <button
                            type="button"
                            className="w-full py-4 bg-white border-2 border-gray-200 rounded-xl text-base font-medium text-gray-800 transition-all duration-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center gap-3"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" />
                                <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" />
                                <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" />
                                <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" />
                            </svg>
                            Sign in with Google
                        </button>

                        {/* Sign Up Link */}
                        <div className="text-center mt-8 text-gray-600 text-sm">
                            Don't have an account yet? <Link href="/register" className="text-blue-500 font-semibold hover:underline">Sign Up</Link>
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

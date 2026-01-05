'use client';

import Link from 'next/link';

function FAQItem({ question, answer }: { question: string; answer: string }) {
    return (
        <details className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 group">
            <summary className="cursor-pointer font-semibold text-white text-lg flex items-center justify-between">
                {question}
                <span className="text-blue-400 group-open:rotate-180 transition-transform duration-300">▼</span>
            </summary>
            <p className="mt-4 text-gray-300 leading-relaxed">{answer}</p>
        </details>
    );
}

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden relative">
            {/* Animated Background Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-[float_8s_ease-in-out_infinite]"></div>
                <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-[float_10s_ease-in-out_infinite_2s]"></div>
                <div className="absolute bottom-[15%] left-[15%] w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-[float_9s_ease-in-out_infinite_4s]"></div>
                <div className="absolute bottom-[20%] right-[20%] w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-[float_7s_ease-in-out_infinite_1s]"></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                        ⚡
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        AntiGravity
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="px-6 py-2.5 text-gray-300 hover:text-white transition-colors duration-300 font-medium"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2 mb-8 border border-white/20">
                        <span className="text-2xl">🚀</span>
                        <span className="text-sm font-medium">The Ultimate Productivity Platform</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                        Level Up Your
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                            Productivity
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Track your daily activities, manage your budget, plan your studies,
                        and gamify your progress. Built for students and developers who want to achieve more.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
                        >
                            Start Free Today 🎯
                        </Link>
                        <Link
                            href="/myprofile"
                            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all duration-300 w-full sm:w-auto"
                        >
                            View Demo Portfolio
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                100%
                            </div>
                            <div className="text-sm text-gray-400">Free Forever</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                                ⚡
                            </div>
                            <div className="text-sm text-gray-400">Quick Setup</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                            <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
                                🔒
                            </div>
                            <div className="text-sm text-gray-400">Secure & Private</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
                    Everything You Need to
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Succeed</span>
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                            📊
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Activity Tracking</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Track your coding, studying, and exercise time. Visualize your progress with beautiful charts and insights.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                            💰
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Budget Manager</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Set budgets, track expenses, and manage your finances. Stay on top of your spending habits effortlessly.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-pink-500/20">
                        <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                            📚
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Study Planner</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Plan your study sessions, set semester goals, and track your academic progress with smart scheduling.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-500/20">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                            🎮
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Gamification</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Earn points, unlock achievements, and compete with yourself. Turn productivity into an addictive game.
                        </p>
                    </div>

                    {/* Feature 5 */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/20">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                            🌐
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Public Portfolio</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Showcase your achievements with a beautiful public portfolio. Share your progress with the world.
                        </p>
                    </div>

                    {/* Feature 6 */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-yellow-500/20">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                            ⚡
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Daily Dashboard</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Get a complete overview of your day. See your tasks, budget, and progress all in one beautiful dashboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
                    Loved by
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Productive People</span>
                </h2>
                <p className="text-center text-gray-400 mb-16 text-lg">See what our users have to say</p>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Testimonial 1 */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center gap-1 mb-4">
                            <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-6">
                            "AntiGravity transformed how I manage my time. The gamification keeps me motivated, and I've never been more productive!"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl">
                                👨‍💻
                            </div>
                            <div>
                                <div className="font-semibold text-white">Alex Johnson</div>
                                <div className="text-sm text-gray-400">Software Developer</div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center gap-1 mb-4">
                            <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-6">
                            "The budget tracker saved me so much money! I finally know where my money goes. Highly recommend to all students."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                                👩‍🎓
                            </div>
                            <div>
                                <div className="font-semibold text-white">Sarah Chen</div>
                                <div className="text-sm text-gray-400">University Student</div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 3 */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center gap-1 mb-4">
                            <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-6">
                            "Best productivity app I've ever used. The public portfolio feature is amazing for showcasing my progress to recruiters."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-xl">
                                👨‍🎨
                            </div>
                            <div>
                                <div className="font-semibold text-white">Mike Rodriguez</div>
                                <div className="text-sm text-gray-400">Competitive Programmer</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="relative z-10 max-w-4xl mx-auto px-8 pb-32">
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
                    Frequently Asked
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Questions</span>
                </h2>
                <p className="text-center text-gray-400 mb-16 text-lg">Everything you need to know</p>

                <div className="space-y-4">
                    <FAQItem
                        question="Is AntiGravity really free?"
                        answer="Yes! AntiGravity is 100% free forever. No hidden fees, no premium tiers, no credit card required."
                    />
                    <FAQItem
                        question="How does the gamification work?"
                        answer="Every time you log activities, complete tasks, or stay on budget, you earn points and unlock achievements. Your rating increases as you maintain consistency and reach milestones."
                    />
                    <FAQItem
                        question="Can I make my portfolio private?"
                        answer="Absolutely! You have full control over your portfolio visibility. You can make it public, private, or share it via a custom URL."
                    />
                    <FAQItem
                        question="Is my data secure?"
                        answer="Security is our top priority. All data is encrypted and stored securely. We never share your personal information with third parties."
                    />
                    <FAQItem
                        question="Can I export my data?"
                        answer="Yes! You can export all your data anytime in multiple formats (CSV, JSON). Your data belongs to you."
                    />
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative z-10 max-w-4xl mx-auto px-8 pb-32 text-center">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-3xl p-12 border border-white/20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Level Up?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join the productivity revolution. Start tracking, planning, and achieving your goals today.
                    </p>
                    <Link
                        href="/register"
                        className="inline-block px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-1"
                    >
                        Get Started Free 🚀
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 py-8">
                <div className="max-w-7xl mx-auto px-8 text-center text-gray-400">
                    <p>© 2026 AntiGravity. Built for students and developers who refuse to settle.</p>
                </div>
            </footer>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    50% { transform: translateY(-30px) translateX(20px); }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
}

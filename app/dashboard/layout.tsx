'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { handleLogout } from './actions';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f1115] transition-colors duration-200">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">
                        ⚡
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-100">AntiGravity</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                    {isSidebarOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30
                w-72 bg-white dark:bg-[#161b22] border-r border-gray-200 dark:border-gray-800 
                flex flex-col shadow-sm transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo (Desktop) */}
                <div className="hidden md:block p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
                            ⚡
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-800 dark:text-gray-100">AntiGravity</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Productivity Platform</div>
                        </div>
                    </div>
                </div>

                {/* Mobile Logo (in sidebar) */}
                <div className="md:hidden p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-800 dark:text-gray-100">Menu</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500">✕</button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <DashboardLink href="/dashboard" icon="📊" label="Overview" onClick={() => setIsSidebarOpen(false)} />
                    <DashboardLink href="/dashboard/plan" icon="📅" label="Daily Plan" onClick={() => setIsSidebarOpen(false)} />
                    <DashboardLink href="/dashboard/activities" icon="⏱️" label="Activity Tracker" onClick={() => setIsSidebarOpen(false)} />
                    <DashboardLink href="/dashboard/budget" icon="💰" label="Budget & Finance" onClick={() => setIsSidebarOpen(false)} />
                    <DashboardLink href="/dashboard/study" icon="📚" label="Academic & Study" onClick={() => setIsSidebarOpen(false)} />
                    <DashboardLink href="/dashboard/history" icon="📉" label="Rating History" onClick={() => setIsSidebarOpen(false)} />
                    <DashboardLink href="/dashboard/portfolio" icon="🌐" label="Public Portfolio" onClick={() => setIsSidebarOpen(false)} />
                    <div className="my-2 border-t border-gray-200 dark:border-gray-800"></div>
                    <DashboardLink href="/dashboard/settings" icon="⚙️" label="Settings" onClick={() => setIsSidebarOpen(false)} />
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
                        <ThemeToggle />
                    </div>
                    <form action={handleLogout}>
                        <button
                            type="submit"
                            className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors duration-200 font-medium flex items-center gap-2"
                        >
                            <span>🚪</span>
                            <span>Logout</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function DashboardLink({ href, icon, label, onClick }: { href: string; icon: string; label: string; onClick?: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
            `}
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}

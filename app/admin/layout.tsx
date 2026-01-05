'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/verifications', label: 'Verifications', icon: '✅' },
    { href: '/admin/password-resets', label: 'Password Resets', icon: '🔑' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { href: '/admin/logs', label: 'Audit Logs', icon: '📋' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0c10] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#161b22] border-r border-gray-200 dark:border-gray-800 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">🛡️</span>
                        Admin Panel
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="text-lg">←</span>
                        <span>Back to App</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}

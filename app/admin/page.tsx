'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
    totalUsers: number;
    activeUsers: number;
    newToday: number;
    newThisWeek: number;
    pendingVerifications: number;
    pendingPasswordResets: number;
    totalPortfolios: number;
    averageRating: number;
    suspendedUsers: number;
    trends: {
        signups: number;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/dashboard');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                setError('Failed to load dashboard');
            }
        } catch {
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">System overview and key metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon="👥"
                    color="blue"
                />
                <StatCard
                    title="Active (7 days)"
                    value={stats?.activeUsers || 0}
                    icon="⚡"
                    color="green"
                />
                <StatCard
                    title="New Today"
                    value={stats?.newToday || 0}
                    icon="🆕"
                    color="purple"
                />
                <StatCard
                    title="New This Week"
                    value={stats?.newThisWeek || 0}
                    icon="📅"
                    color="indigo"
                    trend={stats?.trends.signups}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Pending Verifications"
                    value={stats?.pendingVerifications || 0}
                    icon="⏳"
                    color="yellow"
                    href="/admin/verifications"
                />
                <StatCard
                    title="Password Resets"
                    value={stats?.pendingPasswordResets || 0}
                    icon="🔑"
                    color="orange"
                    href="/admin/password-resets"
                />
                <StatCard
                    title="Total Portfolios"
                    value={stats?.totalPortfolios || 0}
                    icon="📁"
                    color="teal"
                />
                <StatCard
                    title="Suspended Users"
                    value={stats?.suspendedUsers || 0}
                    icon="🚫"
                    color="red"
                />
            </div>

            {/* Average Rating */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#161b22] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Average User Rating
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                            {stats?.averageRating || 1000}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                            System-wide average rating across all active users
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#161b22] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <QuickAction href="/admin/users" label="Manage Users" icon="👥" />
                        <QuickAction href="/admin/verifications" label="Review Verifications" icon="✅" />
                        <QuickAction href="/admin/analytics" label="View Analytics" icon="📈" />
                        <QuickAction href="/admin/logs" label="Audit Logs" icon="📋" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    color,
    trend,
    href
}: {
    title: string;
    value: number;
    icon: string;
    color: string;
    trend?: number;
    href?: string;
}) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900',
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900',
        orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900',
        teal: 'bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-900',
        red: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900',
    };

    const content = (
        <div className={`rounded-xl p-5 border ${colorClasses[color] || colorClasses.blue} ${href ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <span className="text-2xl">{icon}</span>
            </div>
            {trend !== undefined && (
                <div className="mt-2">
                    <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
                    </span>
                </div>
            )}
        </div>
    );

    if (href) {
        return <a href={href}>{content}</a>;
    }
    return content;
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <a
            href={href}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            <span className="text-xl">{icon}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </a>
    );
}

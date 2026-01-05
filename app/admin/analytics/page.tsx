'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Analytics {
    userGrowth: { date: string; count: number }[];
    ratingDistribution: { bracket: string; count: number }[];
    dailyActiveUsers: { date: string; count: number }[];
    portfolioStats: { total: number; complete: number; rate: number };
    taskStats: { total: number; completed: number; rate: number };
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics?days=${days}`);
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch {
            console.error('Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    }, [days, router]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleExport = async (type: string) => {
        window.open(`/api/admin/analytics/export?type=${type}`, '_blank');
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-500">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">System-wide statistics and trends</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161b22]"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                    <button
                        onClick={() => handleExport('users')}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Export Users CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-[#161b22] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Completion</h3>
                    <div className="flex items-center gap-6">
                        <div className="text-4xl font-bold text-blue-600">{analytics?.portfolioStats.rate}%</div>
                        <div className="text-gray-500">
                            <div>{analytics?.portfolioStats.complete} complete</div>
                            <div>{analytics?.portfolioStats.total} total users</div>
                        </div>
                    </div>
                    <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full"
                            style={{ width: `${analytics?.portfolioStats.rate || 0}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#161b22] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Completion</h3>
                    <div className="flex items-center gap-6">
                        <div className="text-4xl font-bold text-green-600">{analytics?.taskStats.rate}%</div>
                        <div className="text-gray-500">
                            <div>{analytics?.taskStats.completed} completed</div>
                            <div>{analytics?.taskStats.total} total tasks</div>
                        </div>
                    </div>
                    <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                            className="bg-green-600 h-3 rounded-full"
                            style={{ width: `${analytics?.taskStats.rate || 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white dark:bg-[#161b22] rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating Distribution</h3>
                <div className="space-y-3">
                    {analytics?.ratingDistribution.map((item) => {
                        const maxCount = Math.max(...(analytics?.ratingDistribution.map(r => r.count) || [1]));
                        const width = (item.count / maxCount) * 100;
                        return (
                            <div key={item.bracket} className="flex items-center gap-4">
                                <div className="w-40 text-sm text-gray-600 dark:text-gray-400">{item.bracket}</div>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                                        style={{ width: `${Math.max(width, 10)}%` }}
                                    >
                                        <span className="text-xs text-white font-medium">{item.count}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* User Growth */}
            <div className="bg-white dark:bg-[#161b22] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Signups (Last {days} days)</h3>
                <div className="h-48 flex items-end gap-1">
                    {analytics?.userGrowth.map((item, i) => {
                        const maxCount = Math.max(...(analytics?.userGrowth.map(u => u.count) || [1]));
                        const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                            <div
                                key={i}
                                className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                                style={{ height: `${Math.max(height, 5)}%` }}
                                title={`${new Date(item.date).toLocaleDateString()}: ${item.count} signups`}
                            />
                        );
                    })}
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>{analytics?.userGrowth[0]?.date ? new Date(analytics.userGrowth[0].date).toLocaleDateString() : ''}</span>
                    <span>{analytics?.userGrowth[analytics.userGrowth.length - 1]?.date ? new Date(analytics.userGrowth[analytics.userGrowth.length - 1].date).toLocaleDateString() : ''}</span>
                </div>
            </div>
        </div>
    );
}

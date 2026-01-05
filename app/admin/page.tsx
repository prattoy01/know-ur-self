'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string | null;
    emailVerified: string | null;
    isAdmin: boolean;
    createdAt: string;
    portfolioComplete: boolean;
}

interface Stats {
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    newThisWeek: number;
}

export default function AdminPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchUsers = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                search,
                filter,
                page: currentPage.toString()
            });
            const res = await fetch(`/api/admin/users?${params}`);
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users);
                setTotalPages(data.pages);
            } else {
                setError(data.error || 'Failed to fetch users');
            }
        } catch {
            setError('Failed to fetch users');
        }
    }, [search, filter, currentPage, router]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch {
            // Stats are optional
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchUsers(), fetchStats()]);
            setLoading(false);
        };
        loadData();
    }, [fetchUsers, fetchStats]);

    const handleVerify = async (userId: string) => {
        setActionLoading(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}/verify`, {
                method: 'POST'
            });
            if (res.ok) {
                await fetchUsers();
                await fetchStats();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to verify user');
            }
        } catch {
            alert('Failed to verify user');
        }
        setActionLoading(null);
    };

    const handleDelete = async (userId: string, email: string) => {
        if (!confirm(`Are you sure you want to delete ${email}? This cannot be undone.`)) {
            return;
        }
        setActionLoading(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await fetchUsers();
                await fetchStats();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete user');
            }
        } catch {
            alert('Failed to delete user');
        }
        setActionLoading(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0f1115] flex items-center justify-center">
                <div className="text-2xl text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

    if (error && users.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0f1115] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl text-red-500 mb-4">⚠️ {error}</div>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1115] p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage users and view statistics
                    </p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            label="Total Users"
                            value={stats.totalUsers}
                            icon="👥"
                            color="blue"
                        />
                        <StatCard
                            label="Verified"
                            value={stats.verifiedUsers}
                            icon="✅"
                            color="green"
                        />
                        <StatCard
                            label="Unverified"
                            value={stats.unverifiedUsers}
                            icon="⏳"
                            color="yellow"
                        />
                        <StatCard
                            label="New This Week"
                            value={stats.newThisWeek}
                            icon="🆕"
                            color="purple"
                        />
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-lg p-4 mb-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search by email or name..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f1115] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                            {['all', 'verified', 'unverified'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => {
                                        setFilter(f as typeof filter);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-[#0f1115]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#1c2128]">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.name || 'No name'}
                                                    {user.isAdmin && (
                                                        <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.emailVerified ? (
                                                <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                                    ✓ Verified
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                                                    ⏳ Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {!user.emailVerified && (
                                                    <button
                                                        onClick={() => handleVerify(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                                                    >
                                                        {actionLoading === user.id ? '...' : 'Verify'}
                                                    </button>
                                                )}
                                                {!user.isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.email)}
                                                        disabled={actionLoading === user.id}
                                                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                                                    >
                                                        {actionLoading === user.id ? '...' : 'Delete'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <div className="mt-6">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    }[color];

    return (
        <div className={`rounded-xl p-4 border ${colorClasses}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
        </div>
    );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
    emailVerified: string | null;
    role: string;
    status: string;
    isAdmin: boolean;
    rating: number;
    rank: string;
    portfolioComplete: boolean;
    lastActiveDate: string;
    createdAt: string;
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search,
                filter,
                role: roleFilter,
                status: statusFilter,
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
            }
        } catch {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [search, filter, roleFilter, statusFilter, currentPage, router]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAction = async (userId: string, action: string) => {
        if (action === 'delete' && !confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        if (action === 'suspend' && !confirm('Are you sure you want to suspend this user?')) {
            return;
        }

        setActionLoading(userId);
        try {
            let url = `/api/admin/users/${userId}`;
            let method = 'POST';

            switch (action) {
                case 'verify':
                    url += '/verify';
                    break;
                case 'suspend':
                    url += '/suspend';
                    break;
                case 'unsuspend':
                    url += '/unsuspend';
                    break;
                case 'delete':
                    method = 'DELETE';
                    break;
            }

            const res = await fetch(url, { method });
            if (res.ok) {
                await fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Action failed');
            }
        } catch {
            alert('Action failed');
        }
        setActionLoading(null);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            suspended: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            deleted: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage all users</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#161b22] rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-800">
                <div className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Search by email, name, username..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0c10] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={filter}
                        onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0c10] text-gray-900 dark:text-white"
                    >
                        <option value="all">All Verification</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                    </select>
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0c10] text-gray-900 dark:text-white"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0c10] text-gray-900 dark:text-white"
                    >
                        <option value="all">Active Only</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="deleted">Deleted</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#161b22] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[#0a0c10]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Verified</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rating</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Active</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No users found</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#1c2128]">
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {user.name || 'No name'}
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                                        <td className="px-4 py-3">
                                            {user.emailVerified ? (
                                                <span className="text-green-600">✓</span>
                                            ) : (
                                                <span className="text-yellow-600">✗</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900 dark:text-white">{user.rating}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(user.lastActiveDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                                >
                                                    View
                                                </button>
                                                {!user.emailVerified && user.status === 'active' && (
                                                    <button
                                                        onClick={() => handleAction(user.id, 'verify')}
                                                        disabled={actionLoading === user.id}
                                                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        Verify
                                                    </button>
                                                )}
                                                {user.status === 'active' && user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleAction(user.id, 'suspend')}
                                                        disabled={actionLoading === user.id}
                                                        className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                                {user.status === 'suspended' && (
                                                    <button
                                                        onClick={() => handleAction(user.id, 'unsuspend')}
                                                        disabled={actionLoading === user.id}
                                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        Unsuspend
                                                    </button>
                                                )}
                                                {user.role !== 'admin' && user.status !== 'deleted' && (
                                                    <button
                                                        onClick={() => handleAction(user.id, 'delete')}
                                                        disabled={actionLoading === user.id}
                                                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white dark:bg-[#161b22] rounded-xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h2>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="space-y-3">
                            <div><span className="text-gray-500">Email:</span> <span className="text-gray-900 dark:text-white">{selectedUser.email}</span></div>
                            <div><span className="text-gray-500">Name:</span> <span className="text-gray-900 dark:text-white">{selectedUser.name || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Username:</span> <span className="text-gray-900 dark:text-white">{selectedUser.username || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Role:</span> <span className="text-gray-900 dark:text-white">{selectedUser.role}</span></div>
                            <div><span className="text-gray-500">Status:</span> {getStatusBadge(selectedUser.status)}</div>
                            <div><span className="text-gray-500">Rating:</span> <span className="text-gray-900 dark:text-white">{selectedUser.rating} ({selectedUser.rank})</span></div>
                            <div><span className="text-gray-500">Verified:</span> <span className="text-gray-900 dark:text-white">{selectedUser.emailVerified ? 'Yes' : 'No'}</span></div>
                            <div><span className="text-gray-500">Portfolio:</span> <span className="text-gray-900 dark:text-white">{selectedUser.portfolioComplete ? 'Complete' : 'Incomplete'}</span></div>
                            <div><span className="text-gray-500">Joined:</span> <span className="text-gray-900 dark:text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

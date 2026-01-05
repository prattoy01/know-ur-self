'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface PasswordResetRequest {
    id: string;
    userId: string;
    user: {
        id: string;
        email: string;
        name: string | null;
    };
    status: string;
    expiresAt: string;
    createdAt: string;
    isExpired: boolean;
}

export default function PasswordResetsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status: statusFilter, page: currentPage.toString() });
            const res = await fetch(`/api/admin/password-resets?${params}`);
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            if (res.ok) {
                setRequests(data.requests);
                setTotalPages(data.pages);
            }
        } catch {
            console.error('Failed to fetch');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, currentPage, router]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (id: string, action: 'resend' | 'invalidate') => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/password-resets/${id}/${action}`, { method: 'POST' });
            if (res.ok) {
                await fetchRequests();
            } else {
                const data = await res.json();
                alert(data.error || 'Action failed');
            }
        } catch {
            alert('Action failed');
        }
        setActionLoading(null);
    };

    const getStatusBadge = (status: string, isExpired: boolean) => {
        if (isExpired && status === 'pending') {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600">expired</span>;
        }
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            used: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            invalidated: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Password Reset Requests</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage password reset requests</p>
            </div>

            {/* Filter */}
            <div className="mb-6">
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161b22] text-gray-900 dark:text-white"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="used">Used</option>
                    <option value="invalidated">Invalidated</option>
                </select>
            </div>

            <div className="bg-white dark:bg-[#161b22] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[#0a0c10]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No password reset requests</td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-[#1c2128]">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {req.user.name || 'No name'}
                                                </div>
                                                <div className="text-sm text-gray-500">{req.user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(req.status, req.isExpired)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(req.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(req.expiresAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(req.id, 'resend')}
                                                            disabled={actionLoading === req.id}
                                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                                        >
                                                            Resend
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req.id, 'invalidate')}
                                                            disabled={actionLoading === req.id}
                                                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            Invalidate
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
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
        </div>
    );
}

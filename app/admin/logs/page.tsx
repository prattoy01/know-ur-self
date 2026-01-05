'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLog {
    id: string;
    adminId: string;
    admin: { id: string; email: string; name: string | null };
    actionType: string;
    targetUserId: string | null;
    targetUser: { id: string; email: string; name: string | null } | null;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
}

const actionColors: Record<string, string> = {
    VERIFY_USER: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    APPROVE_VERIFICATION: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    SUSPEND_USER: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    UNSUSPEND_USER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    DELETE_USER: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    REJECT_VERIFICATION: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    RESEND_PASSWORD_RESET: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    INVALIDATE_PASSWORD_RESET: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400',
};

export default function LogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionTypeFilter, setActionTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                ...(actionTypeFilter && { actionType: actionTypeFilter })
            });
            const res = await fetch(`/api/admin/logs?${params}`);
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            if (res.ok) {
                setLogs(data.logs);
                setTotalPages(data.pages);
            }
        } catch {
            console.error('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    }, [actionTypeFilter, currentPage, router]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Complete history of admin actions</p>
            </div>

            {/* Filter */}
            <div className="mb-6">
                <select
                    value={actionTypeFilter}
                    onChange={(e) => { setActionTypeFilter(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161b22] text-gray-900 dark:text-white"
                >
                    <option value="">All Actions</option>
                    <option value="VERIFY_USER">Verify User</option>
                    <option value="APPROVE_VERIFICATION">Approve Verification</option>
                    <option value="REJECT_VERIFICATION">Reject Verification</option>
                    <option value="SUSPEND_USER">Suspend User</option>
                    <option value="UNSUSPEND_USER">Unsuspend User</option>
                    <option value="DELETE_USER">Delete User</option>
                    <option value="RESEND_PASSWORD_RESET">Resend Password Reset</option>
                    <option value="INVALIDATE_PASSWORD_RESET">Invalidate Password Reset</option>
                </select>
            </div>

            <div className="bg-white dark:bg-[#161b22] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[#0a0c10]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No audit logs yet</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-[#1c2128]">
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {log.admin.name || log.admin.email}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${actionColors[log.actionType] || 'bg-gray-100 text-gray-700'}`}>
                                                {log.actionType.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.targetUser ? (
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {log.targetUser.email}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                            {log.details ? (
                                                <span title={log.details}>{log.details}</span>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
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

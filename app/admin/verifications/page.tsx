'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface VerificationRequest {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
}

export default function VerificationsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ id: string; email: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/verifications?page=${currentPage}`);
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
    }, [currentPage, router]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/verifications/${id}/approve`, { method: 'POST' });
            if (res.ok) {
                await fetchRequests();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to approve');
            }
        } catch {
            alert('Failed to approve');
        }
        setActionLoading(null);
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        setActionLoading(rejectModal.id);
        try {
            const res = await fetch(`/api/admin/verifications/${rejectModal.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectReason })
            });
            if (res.ok) {
                setRejectModal(null);
                setRejectReason('');
                await fetchRequests();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to reject');
            }
        } catch {
            alert('Failed to reject');
        }
        setActionLoading(null);
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verification Requests</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Review and approve pending verifications</p>
            </div>

            <div className="bg-white dark:bg-[#161b22] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[#0a0c10]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        No pending verification requests 🎉
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-[#1c2128]">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {req.name || 'No name'}
                                                </div>
                                                <div className="text-sm text-gray-500">{req.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(req.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(req.id)}
                                                    disabled={actionLoading === req.id}
                                                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => setRejectModal({ id: req.id, email: req.email })}
                                                    disabled={actionLoading === req.id}
                                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    ✗ Reject
                                                </button>
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

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setRejectModal(null)}>
                    <div className="bg-white dark:bg-[#161b22] rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reject Verification</h2>
                        <p className="text-gray-500 mb-4">
                            Rejecting verification for <strong>{rejectModal.email}</strong>. This will delete their account.
                        </p>
                        <textarea
                            placeholder="Reason (optional)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0c10] text-gray-900 dark:text-white mb-4 h-24"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setRejectModal(null)}
                                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading === rejectModal.id}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

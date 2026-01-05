'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [showStats, setShowStats] = useState(true);
    const [showRating, setShowRating] = useState(true);

    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setName(data.user.name || '');
                    setBio(data.user.bio || '');
                    setSkills(data.user.skills || '');
                    if (data.user.portfolio) {
                        setCustomUrl(data.user.portfolio.customUrl || '');
                        setIsPublic(data.user.portfolio.isPublic);
                        setShowStats(data.user.portfolio.showStats);
                        setShowRating(data.user.portfolio.showRating);
                    }
                }
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword && newPassword !== confirmPassword) {
            setMsg('Error: New passwords do not match!');
            return;
        }

        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bio,
                skills,
                customUrl,
                isPublic,
                showStats,
                showRating,
                name,
                currentPassword,
                newPassword
            }),
        });

        const data = await res.json();

        if (res.ok) {
            setMsg('Settings saved successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setMsg(''), 3000);
        } else {
            setMsg(`Error: ${data.error || 'Failed to save settings'}`);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <span className="text-4xl">⚙️</span>
                    Settings
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage your public profile and preferences</p>
            </header>

            {msg && (
                <div className={`
                    p-4 rounded-xl text-center font-medium animate-fade-in
                    ${msg.includes('Error')
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}
                `}>
                    {msg}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">

                {/* Profile Section */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <span>👤</span> Profile Settings
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                            <input
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                            <textarea
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills (comma separated)</label>
                            <input
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder="React, Node.js, Calculus"
                            />
                        </div>
                    </div>
                </div>

                {/* Portfolio Section */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <span>🌐</span> Public Portfolio
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom URL Slug</label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 dark:text-gray-500 font-mono bg-gray-50 dark:bg-[#0d1117] px-3 py-3 rounded-l-xl border-y-2 border-l-2 border-gray-200 dark:border-gray-700 border-r-0">
                                    /
                                </span>
                                <input
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-r-xl focus:outline-none focus:border-purple-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 font-mono"
                                    value={customUrl}
                                    onChange={(e) => setCustomUrl(e.target.value)}
                                    placeholder="your-unique-slug"
                                    required
                                />
                            </div>
                            {customUrl && (
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Your portfolio will be at: <a href={`/${customUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">/{customUrl}</a>
                                </p>
                            )}
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Make Profile Public</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showStats}
                                    onChange={(e) => setShowStats(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Show Activity Stats</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showRating}
                                    onChange={(e) => setShowRating(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Show Rating & Rank</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Account Security Section */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <span>🔒</span> Account Security
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-red-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password to change"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-blue-500/30 transform active:scale-95 transition-all w-full md:w-auto"
                    >
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
}

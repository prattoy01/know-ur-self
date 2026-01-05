'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const RatingHistoryPage = () => {
    // Rating tier definitions
    const TIERS = [
        { min: 2200, name: 'Grandmaster', color: '#ef4444' },
        { min: 2000, name: 'International Master', color: '#f97316' },
        { min: 1800, name: 'Master', color: '#fb923c' },
        { min: 1600, name: 'Candidate Master', color: '#a855f7' },
        { min: 1400, name: 'Expert', color: '#3b82f6' },
        { min: 1200, name: 'Specialist', color: '#06b6d4' },
        { min: 1000, name: 'Pupil', color: '#10b981' },
        { min: 800, name: 'Novice', color: '#84cc16' },
        { min: 0, name: 'Beginner', color: '#94a3b8' }
    ];

    const [timeRange, setTimeRange] = useState('all');
    const [expandedDay, setExpandedDay] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [allHistory, setAllHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [flashingChange, setFlashingChange] = useState<number | null>(null);

    // Fetch real history from API with polling for LIVE updates
    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/history');
            if (res.ok) {
                const data = await res.json();
                if (data.history) {
                    const formatted = data.history.map((h: any, idx: number) => ({
                        id: h.isLive ? 'LIVE' : idx,
                        date: h.date,
                        fullDate: new Date(h.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }),
                        oldRating: h.oldRating,
                        newRating: h.newRating,
                        change: h.change,
                        dps: h.dps,
                        breakdown: h.breakdown,
                        isLive: h.isLive || false
                    }));

                    // Detect change for animation
                    if (allHistory.length > 0 && formatted.length > 0) {
                        const oldLive = allHistory.find((h: any) => h.isLive);
                        const newLive = formatted.find((h: any) => h.isLive);
                        if (oldLive && newLive && oldLive.change !== newLive.change) {
                            setFlashingChange(newLive.change);
                            setTimeout(() => setFlashingChange(null), 1000);
                        }
                    }

                    setAllHistory(formatted);
                }
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        // Poll every 3 seconds for LIVE updates
        const interval = setInterval(fetchHistory, 3000);
        return () => clearInterval(interval);
    }, []);

    // Filter history based on time range
    const filteredHistory = useMemo(() => {
        if (timeRange === 'all') return allHistory;

        const days = {
            '7d': 7,
            '30d': 30,
            '90d': 90
        }[timeRange];

        return allHistory.slice(0, days);
    }, [allHistory, timeRange]);

    const getTier = (rating: number) => {
        return TIERS.find(tier => rating >= tier.min);
    };

    const toggleExpand = (id: any) => {
        setExpandedDay(expandedDay === id ? null : id);
    };

    // Graph data (reverse for chronological order)
    const graphData = useMemo(() => {
        return [...filteredHistory].reverse().map(h => ({
            date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            rating: h.newRating,
            isLive: h.isLive
        }));
    }, [filteredHistory]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload[0]) return null;
        const rating = payload[0].value;
        const tier = getTier(rating);
        const isLive = payload[0].payload.isLive;

        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3 rounded shadow-lg">
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {payload[0].payload.date}
                    {isLive && <span className="ml-2 text-green-400 font-bold">LIVE</span>}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{rating}</div>
                <div className="text-xs mt-1" style={{ color: tier?.color }}>{tier?.name}</div>
            </div>
        );
    };

    const currentRating = filteredHistory[0]?.newRating || 0;
    const currentTier = getTier(currentRating);
    // Calculate period change: current rating minus the oldest entry's new rating (starting point)
    const oldestEntry = filteredHistory[filteredHistory.length - 1];
    const startingRating = oldestEntry?.newRating || currentRating;
    const totalChange = currentRating - startingRating;

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex items-center justify-center">
                <div className="text-xl text-gray-600 dark:text-gray-400">Loading history...</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <h1 className="text-3xl font-bold mb-2">Rating History</h1>
                    <p className="text-gray-600 dark:text-gray-400">Complete chronological log of daily performance ratings</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Current Rating</div>
                        <div className="text-2xl font-bold" style={{ color: currentTier?.color }}>
                            {currentRating}
                        </div>
                        <div className="text-xs mt-1" style={{ color: currentTier?.color }}>
                            {currentTier?.name}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Period Change</div>
                        <div className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totalChange > 0 ? '+' : ''}{totalChange}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Days Tracked</div>
                        <div className="text-2xl font-bold text-blue-400">
                            {filteredHistory.length}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Peak Rating</div>
                        <div className="text-2xl font-bold text-purple-400">
                            {allHistory.length > 0 ? Math.max(...allHistory.map(h => h.newRating)) : 0}
                        </div>
                    </div>
                </div>

                {/* Rating Graph */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Rating Progression</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={graphData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" className="dark:stroke-gray-700" />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="linear"
                                dataKey="rating"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={(props: any) => {
                                    const { cx, cy, payload } = props;
                                    return (
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r={payload.isLive ? 5 : 3}
                                            fill={payload.isLive ? '#10b981' : '#3b82f6'}
                                            stroke={payload.isLive ? '#10b981' : '#3b82f6'}
                                            strokeWidth={payload.isLive ? 2 : 0}
                                            className={payload.isLive ? 'animate-pulse' : ''}
                                        />
                                    );
                                }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex gap-2">
                        {[
                            { label: 'Last 7 Days', value: '7d' },
                            { label: 'Last 30 Days', value: '30d' },
                            { label: 'Last 90 Days', value: '90d' },
                            { label: 'All Time', value: 'all' }
                        ].map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => setTimeRange(value)}
                                className={`px-4 py-2 rounded font-medium text-sm transition-colors ${timeRange === value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                    >
                        <Calendar size={16} />
                        Jump to Date
                    </button>
                </div>

                {/* History Table */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    {allHistory.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            No rating history yet. Complete a full day to see your first entry!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-8"></th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Old Rating</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Change</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">New Rating</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">DPS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {filteredHistory.map((day: any) => {
                                        const isExpanded = expandedDay === day.id;
                                        const changeColor = day.change > 0 ? 'text-green-500' : day.change < 0 ? 'text-red-500' : 'text-gray-400';
                                        const newTier = getTier(day.newRating);
                                        const isFlashing = flashingChange === day.change && day.isLive;

                                        return (
                                            <React.Fragment key={day.id}>
                                                <tr
                                                    className={`hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${day.isLive ? 'bg-green-50 dark:bg-green-900/10 border-l-4 border-l-green-500' : ''
                                                        } ${isFlashing ? 'animate-flash-green' : ''}`}
                                                    onClick={() => toggleExpand(day.id)}
                                                >
                                                    <td className="px-4 py-3 text-gray-400">
                                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{day.fullDate}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-500">{day.date.split('T')[0]}</div>
                                                            </div>
                                                            {day.isLive && (
                                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded flex items-center gap-1">
                                                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                                                    LIVE
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">{day.oldRating}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className={`text-sm font-bold ${changeColor} flex items-center justify-end gap-1`}>
                                                            {day.change > 0 && <TrendingUp size={14} />}
                                                            {day.change < 0 && <TrendingDown size={14} />}
                                                            <span>{day.change > 0 ? '+' : ''}{day.change}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-sm font-bold" style={{ color: newTier?.color }}>
                                                            {day.newRating}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">{day.dps}</span>
                                                    </td>
                                                </tr>

                                                {/* Expanded Breakdown */}
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={6} className="bg-gray-50 dark:bg-gray-800/30 px-4 py-6">
                                                            <div className="max-w-5xl">
                                                                <h3 className="text-lg font-semibold mb-4 text-blue-400">
                                                                    Daily Performance Breakdown
                                                                    {day.isLive && <span className="ml-2 text-green-400 text-sm">(LIVE - Updating...)</span>}
                                                                </h3>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    {/* Study Performance */}
                                                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <h4 className="font-semibold text-green-400">📚 Study Performance</h4>
                                                                            <span className="text-lg font-bold text-green-400">
                                                                                {day.breakdown.studyScore > 0 ? '+' : ''}{day.breakdown.studyScore}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                            Study session tracking and goal completion
                                                                        </div>
                                                                    </div>

                                                                    {/* Plan Completion */}
                                                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <h4 className="font-semibold text-purple-400">📅 Plan Completion</h4>
                                                                            <span className="text-lg font-bold text-purple-400">
                                                                                {day.breakdown.planScore > 0 ? '+' : ''}{day.breakdown.planScore}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                            Task completion vs planned targets
                                                                        </div>
                                                                    </div>

                                                                    {/* Activity Tracker */}
                                                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <h4 className="font-semibold text-blue-400">⏱️ Activity Tracker</h4>
                                                                            <span className="text-lg font-bold text-blue-400">
                                                                                {day.breakdown.activityScore > 0 ? '+' : ''}{day.breakdown.activityScore}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                            Timer-based activity tracking
                                                                        </div>
                                                                    </div>

                                                                    {/* Budget Discipline */}
                                                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <h4 className="font-semibold text-orange-400">💰 Budget Discipline</h4>
                                                                            <span className={`text-lg font-bold ${day.breakdown.budgetScore < 0 ? 'text-red-400' : 'text-orange-400'}`}>
                                                                                {day.breakdown.budgetScore > 0 ? '+' : ''}{day.breakdown.budgetScore}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                            Spending vs budget targets
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Discipline Penalty */}
                                                                {day.breakdown.disciplinePenalty < 0 && (
                                                                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-900/30">
                                                                        <div className="flex items-center justify-between">
                                                                            <h4 className="font-semibold text-red-400">⚠️ Discipline Penalty</h4>
                                                                            <span className="text-lg font-bold text-red-400">{day.breakdown.disciplinePenalty}</span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                            Late task creation or deletions
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Relative Adjustment */}
                                                                {day.breakdown.relativeAdjustment !== 0 && (
                                                                    <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                                        <div className="flex items-center justify-between">
                                                                            <h4 className="font-semibold text-cyan-400">⚖️ Relative Adjustment</h4>
                                                                            <span className={`text-lg font-bold ${day.breakdown.relativeAdjustment > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                                                                                {day.breakdown.relativeAdjustment > 0 ? '+' : ''}{day.breakdown.relativeAdjustment}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                            Performance vs 7-day average
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Summary */}
                                                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-gray-600 dark:text-gray-400">Total Daily Performance Score (DPS):</span>
                                                                        <span className="text-xl font-bold text-gray-900 dark:text-white">{day.dps}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between text-sm mt-2">
                                                                        <span className="text-gray-600 dark:text-gray-400">Rating Change:</span>
                                                                        <span className={`text-xl font-bold ${changeColor}`}>
                                                                            {day.change > 0 ? '+' : ''}{day.change}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                <div className="mt-6 bg-yellow-50 dark:bg-gray-900 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4">
                    <div className="flex gap-3">
                        <div className="text-yellow-500 text-xl">🔒</div>
                        <div>
                            <div className="font-semibold text-yellow-600 dark:text-yellow-500 mb-1">
                                Today: LIVE · Past: Locked
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Today's rating updates in real-time as you complete tasks. Past days are finalized and cannot be edited. This ensures an honest, permanent record of your discipline journey.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatingHistoryPage;

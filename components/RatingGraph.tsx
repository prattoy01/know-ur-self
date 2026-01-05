'use client';

import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea
} from 'recharts';

interface RatingEntry {
    id: string;
    rating: number;
    date: string;
    rank: string;
    contestName?: string;
    change?: number;
}

export default function RatingGraph() {
    const [data, setData] = useState<RatingEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/rating/history')
            .then(res => res.json())
            .then(data => {
                if (data.history) {
                    // Format dates
                    const formatted = data.history.map((item: any) => ({
                        ...item,
                        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
                        fullDate: new Date(item.date).toLocaleDateString()
                    }));
                    setData(formatted);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);


    if (loading) return <div className="h-[300px] w-full flex items-center justify-center text-gray-500 dark:text-gray-400">Loading Graph...</div>;

    if (data.length === 0) {
        return (
            <div className="w-full h-[400px] bg-gray-50 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#333] p-4 flex flex-col items-center justify-center transition-colors duration-200">
                <h3 className="text-gray-800 dark:text-gray-100 font-bold mb-4">Rating History</h3>
                <div className="text-gray-500 dark:text-gray-400 text-center">
                    <p className="mb-2">No rating history yet.</p>
                    <p className="text-sm">Start completing activities to build your rating graph!</p>
                </div>
            </div>
        );
    }

    // Dynamic Y-axis scaling based on actual data
    const ratings = data.map(d => d.rating);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);

    // Add padding (15% on each side) for better visualization
    const range = maxRating - minRating;
    const padding = Math.max(range * 0.15, 100); // At least 100 points padding
    const minY = Math.max(0, Math.floor((minRating - padding) / 100) * 100);
    const maxY = Math.ceil((maxRating + padding) / 100) * 100;

    // Only show rank bands that are relevant to the user's rating range
    const rankBands = [
        { min: 0, max: 1200, color: '#cccccc', label: 'Newbie', labelColor: '#999' },
        { min: 1200, max: 1400, color: '#77ff77', label: 'Pupil', labelColor: '#4d994d' },
        { min: 1400, max: 1600, color: '#77ddff', label: 'Specialist', labelColor: '#4da6bf' },
        { min: 1600, max: 1900, color: '#0000ff', label: 'Expert', labelColor: '#4d4dbf' },
        { min: 1900, max: 2100, color: '#a0a', label: 'Candidate Master', labelColor: '#800080' },
        { min: 2100, max: 2300, color: '#ff8c00', label: 'Master', labelColor: '#bf6900' },
        { min: 2300, max: 2400, color: '#ff8c00', label: 'International Master', labelColor: '#bf6900' },
        { min: 2400, max: 2600, color: '#ff0000', label: 'Grandmaster', labelColor: '#bf0000' },
        { min: 2600, max: 3500, color: '#ff0000', label: 'International Grandmaster', labelColor: '#bf0000' },
    ];

    // Filter bands to show only those within or near the visible range
    const visibleBands = rankBands.filter(band =>
        (band.max >= minY && band.min <= maxY) ||
        (band.min <= maxY && band.max >= minY)
    );

    return (
        <div className="w-full h-[400px] bg-white dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#333] p-4 font-sans relative overflow-hidden transition-colors duration-200">
            <h3 className="text-gray-800 dark:text-gray-100 font-bold mb-4 ml-2">Rating History</h3>

            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    {/* Dynamic Color Bands */}
                    {visibleBands.map((band, idx) => (
                        <ReferenceArea
                            key={idx}
                            y1={Math.max(band.min, minY)}
                            y2={Math.min(band.max, maxY)}
                            fill={band.color}
                            fillOpacity={0.15}
                            stroke="none"
                            label={idx === 0 || band.min >= minY ? {
                                value: band.label,
                                position: 'insideTopLeft',
                                fill: band.labelColor,
                                fontSize: 10
                            } : undefined}
                        />
                    ))}

                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af" // gray-400
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        domain={[minY, maxY]}
                        stroke="#9ca3af" // gray-400
                        tick={{ fontSize: 12 }}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--tooltip-bg, #fff)',
                            borderColor: 'var(--tooltip-border, #e5e7eb)',
                            color: 'var(--tooltip-text, #1f2937)'
                        }}
                        itemStyle={{ color: '#ffd700' }}
                        formatter={(value: any) => [value, 'Rating']}
                        labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0) {
                                return payload[0].payload.fullDate + (payload[0].payload.contestName ? ` - ${payload[0].payload.contestName}` : '');
                            }
                            return label;
                        }}
                    />

                    <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#fbbf24" // amber-400
                        strokeWidth={2}
                        dot={{ fill: '#fbbf24', r: 3, stroke: '#fff', strokeWidth: 1 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* CSS Variables for Tooltip Theme Adaptation */}
            <style jsx global>{`
                [data-theme='dark'] {
                    --tooltip-bg: #1f2937;
                    --tooltip-border: #374151;
                    --tooltip-text: #f3f4f6;
                }
                [data-theme='light'] {
                    --tooltip-bg: #ffffff;
                    --tooltip-border: #e5e7eb;
                    --tooltip-text: #1f2937;
                }
                
                /* Dark mode specific overrides for chart elements that don't accept classes directly */
                [data-theme='dark'] .recharts-cartesian-grid-horizontal line {
                    stroke: #374151;
                }
            `}</style>
        </div>
    );
}

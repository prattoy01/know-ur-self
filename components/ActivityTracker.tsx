'use client';

import { useState, useEffect } from 'react';

type Activity = {
    id: string;
    type: string;
    name?: string;
    duration: number;
    date: string;
    notes?: string;
};

export default function ActivityTracker() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [type, setType] = useState('STUDY');
    const [name, setName] = useState('');
    const [notes, setNotes] = useState('');
    const [plannedDuration, setPlannedDuration] = useState('60'); // Expected time in minutes

    // Timer State
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const fetchActivities = async () => {
        try {
            const res = await fetch('/api/activities');
            if (res.ok) {
                const data = await res.json();
                setActivities(data.activities);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // State for alarm
    const [alarmPlayed, setAlarmPlayed] = useState(false);

    useEffect(() => {
        // Restore timer state
        const stored = localStorage.getItem('activity_timer_state');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                const start = new Date(data.startTime);
                if (!isNaN(start.getTime())) {
                    setStartTime(start);
                    setIsTimerRunning(true);
                    setType(data.type || 'STUDY');
                    setName(data.name || '');
                    setNotes(data.notes || '');
                    setPlannedDuration(data.plannedDuration || '60');
                    setAlarmPlayed(data.alarmPlayed || false);
                }
            } catch (e) {
                console.error("Failed to restore timer state", e);
                localStorage.removeItem('activity_timer_state');
            }
        }
        fetchActivities();
    }, []);

    // Alarm Sound (Simple Beep)
    const playAlarm = () => {
        try {
            // A simple pleasant notification sound (Base64 MP3)
            const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/Galaxy/galaxy_win.mp3');
            // Alternatively use a reliably hosted file or base64. 
            // Using a public domain sound for reliability.
            audio.play().catch(e => console.error("Audio playback blocked", e));
        } catch (e) {
            console.error("Failed to play alarm", e);
        }
    };

    // Timer tick effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && startTime) {
            interval = setInterval(() => {
                const now = new Date();
                const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                setElapsedSeconds(elapsed);

                // Check for Alarm
                const plannedSeconds = Number(plannedDuration) * 60;
                if (elapsed >= plannedSeconds && !alarmPlayed && plannedSeconds > 0) {
                    playAlarm();
                    setAlarmPlayed(true);
                    // Update persistence immediately so we don't replay on refresh
                    const currentStored = localStorage.getItem('activity_timer_state');
                    if (currentStored) {
                        const data = JSON.parse(currentStored);
                        localStorage.setItem('activity_timer_state', JSON.stringify({ ...data, alarmPlayed: true }));
                    }
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, startTime, plannedDuration, alarmPlayed]);

    const handleStartTimer = () => {
        const start = new Date();
        setStartTime(start);
        setIsTimerRunning(true);
        setElapsedSeconds(0);
        setAlarmPlayed(false);

        // Persist state
        localStorage.setItem('activity_timer_state', JSON.stringify({
            startTime: start.toISOString(),
            type,
            name,
            notes,
            plannedDuration,
            alarmPlayed: false
        }));
    };

    const handleStopTimer = async () => {
        if (!startTime) return;

        // Calculate duration, minimum 1 minute
        const actualDurationMinutes = Math.max(1, Math.floor(elapsedSeconds / 60));
        const plannedMin = Number(plannedDuration);

        // Check if stopping early
        if (actualDurationMinutes < plannedMin) {
            const shortfall = plannedMin - actualDurationMinutes;
            const shortfallPercent = Math.round((shortfall / plannedMin) * 100);
            const penaltyPoints = Math.round((shortfall / plannedMin) * 50);

            const confirmed = window.confirm(
                `⚠️ Early Stop Warning!\n\n` +
                `Planned: ${plannedMin} minutes\n` +
                `Actual: ${actualDurationMinutes} minutes\n` +
                `Shortfall: ${shortfall} minutes (${shortfallPercent}%)\n\n` +
                `📉 RATING PENALTY: -${penaltyPoints} points\n\n` +
                `This will hurt your Daily Performance Score and lower your rating.\n\n` +
                `Are you sure you want to stop early?`
            );

            if (!confirmed) return;
        }

        try {
            const res = await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    duration: actualDurationMinutes,
                    plannedDuration: plannedMin,
                    name,
                    notes
                }),
            });

            if (res.ok) {
                fetchActivities();
                // Reset form and clear storage
                localStorage.removeItem('activity_timer_state');
                setName('');
                setNotes('');
                setPlannedDuration('60');
                setIsTimerRunning(false);
                setStartTime(null);
                setElapsedSeconds(0);
                setAlarmPlayed(false);
            } else {
                const error = await res.json();
                console.error('Failed to log activity:', error);
                alert(`Failed to log activity: ${error.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Network error. Please check your connection.');
        }
    };

    // Activity type configuration
    const activityConfig: Record<string, { icon: string; gradient: string; color: string }> = {
        'STUDY': { icon: '📚', gradient: 'from-blue-500 to-indigo-600', color: 'text-blue-600' },
        'CODE': { icon: '💻', gradient: 'from-purple-500 to-pink-600', color: 'text-purple-600' },
        'EXERCISE': { icon: '💪', gradient: 'from-green-500 to-emerald-600', color: 'text-green-600' },
        'READING': { icon: '📖', gradient: 'from-orange-500 to-red-600', color: 'text-orange-600' },
        'OTHER': { icon: '⭐', gradient: 'from-gray-500 to-slate-600', color: 'text-gray-600' }
    };

    // Calculate statistics
    const totalMinutes = activities.reduce((acc, act) => acc + act.duration, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    const activityByType = activities.reduce((acc: any, act) => {
        acc[act.type] = (acc[act.type] || 0) + act.duration;
        return acc;
    }, {});

    const todayActivities = activities.filter(act => {
        const actDate = new Date(act.date);
        const today = new Date();
        return actDate.toDateString() === today.toDateString();
    });

    const todayMinutes = todayActivities.reduce((acc, act) => acc + act.duration, 0);

    // Format elapsed time
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                    <span className="text-5xl">⏱️</span>
                    Activity Tracker
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Timer-based activity tracking (strict mode)</p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Total Time</div>
                    <div className="text-3xl font-bold">{totalHours}h {remainingMinutes}m</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Today</div>
                    <div className="text-3xl font-bold">{Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Activities Logged</div>
                    <div className="text-3xl font-bold">{activities.length}</div>
                </div>
            </div>

            {/* Timer Card */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl">
                        ⏱️
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Activity Timer</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Set planned time, then start the timer</p>
                    </div>
                </div>

                {/* Timer Display */}
                {isTimerRunning && (
                    <div className="mb-6 text-center">
                        <div className="text-6xl font-mono font-bold text-gray-800 dark:text-gray-100 mb-2">
                            {formattedTime}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Planned: {plannedDuration}m | Current: {Math.floor(elapsedSeconds / 60)}m
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Activity Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Activity Type
                        </label>
                        <select
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            disabled={isTimerRunning}
                        >
                            <option value="STUDY">📚 Study</option>
                            <option value="CODE">💻 Code</option>
                            <option value="EXERCISE">💪 Exercise</option>
                            <option value="READING">📖 Reading</option>
                            <option value="OTHER">⭐ Other</option>
                        </select>
                    </div>

                    {/* Planned Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Planned Duration (minutes)
                        </label>
                        <input
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                            type="number"
                            min="1"
                            value={plannedDuration}
                            onChange={(e) => setPlannedDuration(e.target.value)}
                            disabled={isTimerRunning}
                            placeholder="e.g., 60"
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Activity Name (Optional)
                        </label>
                        <input
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isTimerRunning}
                            placeholder="e.g., Calculus homework"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 resize-none"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isTimerRunning}
                            placeholder="What did you work on?"
                        />
                    </div>

                    {/* Timer Controls */}
                    <div className="flex gap-4">
                        {!isTimerRunning ? (
                            <button
                                onClick={handleStartTimer}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/40 transition-all duration-300 text-lg"
                            >
                                ▶️ Start Timer
                            </button>
                        ) : (
                            <button
                                onClick={handleStopTimer}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/40 transition-all duration-300 text-lg"
                            >
                                ⏹️ Stop & Log Activity
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Activities</h3>
                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                ) : activities.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No activities logged yet. Start your first timer!</p>
                ) : (
                    <div className="space-y-3">
                        {activities.slice(0, 10).map((activity) => {
                            const config = activityConfig[activity.type] || activityConfig['OTHER'];
                            return (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#0d1117] transition-colors"
                                >
                                    <div className={`text-3xl bg-gradient-to-br ${config.gradient} rounded-xl p-3 text-white`}>
                                        {config.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                                            {activity.name || activity.type}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {activity.duration} minutes · {new Date(activity.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-bold ${config.color}`}>
                                        {activity.duration}m
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

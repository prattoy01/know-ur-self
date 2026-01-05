'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

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
    const [targetTime, setTargetTime] = useState<Date | null>(null);
    const [remainingSeconds, setRemainingSeconds] = useState(0);

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
                // Check if targetTime exists (new format)
                if (data.targetTime) {
                    const target = new Date(data.targetTime);
                    if (!isNaN(target.getTime())) {
                        setTargetTime(target);
                        setIsTimerRunning(true); // Temporarily true, effect will correct if expired
                        setType(data.type || 'STUDY');
                        setName(data.name || '');
                        setNotes(data.notes || '');
                        setPlannedDuration(data.plannedDuration || '60');
                        setAlarmPlayed(data.alarmPlayed || false);

                        // Calculate immediate remaining
                        const now = new Date();
                        const diff = Math.ceil((target.getTime() - now.getTime()) / 1000);
                        setRemainingSeconds(Math.max(0, diff));

                        // If expired while away
                        if (diff <= 0) {
                            setIsTimerRunning(false);
                            // Don't auto-stop/log here, let user see 00:00 and stop manually or just reset?
                            // User asked for "stop at zero".
                            // If we come back and it's done, we show 00:00 and let them log.
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to restore timer state", e);
                localStorage.removeItem('activity_timer_state');
            }
        }
        fetchActivities();
    }, []);

    // Alarm Sound and Confetti
    const playAlarm = () => {
        try {
            // Use Web Audio API for reliable 2-beep alarm
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Play 2 short beeps
            for (let i = 0; i < 2; i++) {
                const startTime = audioContext.currentTime + (i * 0.3);

                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // Alternate between two frequencies for a pleasant alarm
                oscillator.frequency.value = i % 2 === 0 ? 800 : 1000;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.2);
            }
        } catch (e) {
            console.error("Failed to play alarm", e);
        }

        // Confetti from both sides!
        const count = 200;
        const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

        function fire(particleRatio: number, opts: confetti.Options) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        // Left side
        fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0, y: 0.7 } });
        fire(0.2, { spread: 60, origin: { x: 0, y: 0.7 } });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.1, y: 0.7 } });

        // Right side
        fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 1, y: 0.7 } });
        fire(0.2, { spread: 60, origin: { x: 1, y: 0.7 } });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.9, y: 0.7 } });
    };

    // Timer tick effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && targetTime) {
            interval = setInterval(() => {
                const now = new Date();
                const diff = Math.ceil((targetTime.getTime() - now.getTime()) / 1000);

                if (diff <= 0) {
                    // Timer Finished
                    setRemainingSeconds(0);
                    setIsTimerRunning(false); // Stop the timer logic

                    if (!alarmPlayed) {
                        playAlarm();
                        setAlarmPlayed(true);
                        // Update persistence
                        const currentStored = localStorage.getItem('activity_timer_state');
                        if (currentStored) {
                            const data = JSON.parse(currentStored);
                            localStorage.setItem('activity_timer_state', JSON.stringify({ ...data, alarmPlayed: true }));
                        }
                    }
                } else {
                    setRemainingSeconds(diff);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, targetTime, alarmPlayed]);

    const handleStartTimer = () => {
        const durationMins = parseInt(plannedDuration) || 60;
        const now = new Date();
        const target = new Date(now.getTime() + durationMins * 60000);

        setTargetTime(target);
        setIsTimerRunning(true);
        setRemainingSeconds(durationMins * 60);
        setAlarmPlayed(false);

        // Persist state
        localStorage.setItem('activity_timer_state', JSON.stringify({
            targetTime: target.toISOString(),
            type,
            name,
            notes,
            plannedDuration,
            alarmPlayed: false
        }));
    };

    const handleStopTimer = async () => {
        // Calculate duration based on what happened
        // If remaining > 0, we stopped early. Duration = Planned - Remaining.
        // If remaining == 0, Duration = Planned.

        const plannedMin = Number(plannedDuration);
        const remainingMin = remainingSeconds / 60;
        let actualDurationMinutes = Math.floor(plannedMin - remainingMin);

        // Safety check
        actualDurationMinutes = Math.max(1, actualDurationMinutes);

        // Check if stopping early (significant margin)
        if (remainingSeconds > 60) { // More than 1 minute remaining
            const shortfall = Math.ceil(remainingMin);
            const shortfallPercent = Math.round((shortfall / plannedMin) * 100);
            const penaltyPoints = Math.round((shortfall / plannedMin) * 50);

            const confirmed = window.confirm(
                `⚠️ Early Stop Warning!\n\n` +
                `Planned: ${plannedMin} minutes\n` +
                `Remaining: ${shortfall} minutes\n` +
                `Shortfall: ${shortfallPercent}%\n\n` +
                `📉 RATING PENALTY: -${penaltyPoints} points\n\n` +
                `This will hurt your Daily Performance Score.\n` +
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
                setTargetTime(null);
                setRemainingSeconds(0);
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
    const remainingStatsMinutes = totalMinutes % 60; // Renamed to avoid conflict with state

    const todayActivities = activities.filter(act => {
        const actDate = new Date(act.date);
        const today = new Date();
        return actDate.toDateString() === today.toDateString();
    });

    const todayMinutes = todayActivities.reduce((acc, act) => acc + act.duration, 0);

    // Format remaining time
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                    <span className="text-5xl">⏱️</span>
                    Activity Tracker
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Countdown timer & activity logging (strict mode)</p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Total Time</div>
                    <div className="text-3xl font-bold">{totalHours}h {remainingStatsMinutes}m</div>
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
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Countdown Timer</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Timer stops automatically at zero</p>
                    </div>
                </div>

                {/* Timer Display */}
                {(isTimerRunning || remainingSeconds > 0 || targetTime) && (
                    <div className="mb-6 text-center">
                        <div className={`text-6xl font-mono font-bold mb-2 ${remainingSeconds === 0 ? 'text-green-500 dark:text-green-400 animate-pulse' : 'text-gray-800 dark:text-gray-100'}`}>
                            {formattedTime}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {remainingSeconds === 0 ? '✨ Session Complete!' : `Planned: ${plannedDuration}m remaining`}
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
                            disabled={isTimerRunning || !!targetTime}
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
                            disabled={isTimerRunning || !!targetTime}
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
                            disabled={isTimerRunning || !!targetTime}
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
                            disabled={isTimerRunning || !!targetTime}
                            placeholder="What did you work on?"
                        />
                    </div>

                    {/* Timer Controls */}
                    <div className="flex gap-4">
                        {!targetTime ? (
                            <button
                                onClick={handleStartTimer}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/40 transition-all duration-300 text-lg"
                            >
                                ▶️ Start Countdown
                            </button>
                        ) : (
                            <button
                                onClick={handleStopTimer}
                                className={`flex-1 px-6 py-4 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-lg ${remainingSeconds === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-500/40' : 'bg-gradient-to-r from-red-400 to-orange-500 hover:shadow-red-500/40'}`}
                            >
                                {remainingSeconds === 0 ? '✅ Log Completed Activity' : '⏹️ Stop & Log Activity'}
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

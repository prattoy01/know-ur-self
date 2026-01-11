'use client';

import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Maximize, Minimize, RotateCcw, Play, Pause, Square } from 'lucide-react';

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
    const [plannedDuration, setPlannedDuration] = useState('25');

    // Timer State
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [targetTime, setTargetTime] = useState<Date | null>(null);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [pausedAt, setPausedAt] = useState<number | null>(null);

    // UI State
    const [isFullScreen, setIsFullScreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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

    const [alarmPlayed, setAlarmPlayed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('activity_timer_state');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.targetTime) {
                    const target = new Date(data.targetTime);
                    if (!isNaN(target.getTime())) {
                        setTargetTime(target);
                        setIsTimerRunning(!data.isPaused);
                        setIsPaused(data.isPaused || false);
                        setType(data.type || 'STUDY');
                        setName(data.name || '');
                        setNotes(data.notes || '');
                        setPlannedDuration(data.plannedDuration || '25');
                        setAlarmPlayed(data.alarmPlayed || false);

                        if (data.isPaused && data.pausedAt) {
                            setPausedAt(data.pausedAt);
                            setRemainingSeconds(data.pausedAt);
                        } else {
                            const now = new Date();
                            const diff = Math.ceil((target.getTime() - now.getTime()) / 1000);
                            setRemainingSeconds(Math.max(0, diff));
                            if (diff <= 0) setIsTimerRunning(false);
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

    const playAlarm = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            for (let i = 0; i < 2; i++) {
                const startTime = audioContext.currentTime + (i * 0.3);
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
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

        const count = 200;
        const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
        function fire(particleRatio: number, opts: confetti.Options) {
            confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
        }
        fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0, y: 0.7 } });
        fire(0.2, { spread: 60, origin: { x: 0, y: 0.7 } });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.1, y: 0.7 } });
        fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 1, y: 0.7 } });
        fire(0.2, { spread: 60, origin: { x: 1, y: 0.7 } });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.9, y: 0.7 } });
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && !isPaused && targetTime) {
            interval = setInterval(() => {
                const now = new Date();
                const diff = Math.ceil((targetTime.getTime() - now.getTime()) / 1000);
                if (diff <= 0) {
                    setRemainingSeconds(0);
                    setIsTimerRunning(false);
                    if (!alarmPlayed) {
                        playAlarm();
                        setAlarmPlayed(true);
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
    }, [isTimerRunning, isPaused, targetTime, alarmPlayed]);

    const handleStartTimer = () => {
        const durationMins = parseInt(plannedDuration) || 25;
        const now = new Date();
        const target = new Date(now.getTime() + durationMins * 60000);
        setTargetTime(target);
        setIsTimerRunning(true);
        setIsPaused(false);
        setRemainingSeconds(durationMins * 60);
        setAlarmPlayed(false);
        setPausedAt(null);
        localStorage.setItem('activity_timer_state', JSON.stringify({
            targetTime: target.toISOString(), type, name, notes, plannedDuration, alarmPlayed: false, isPaused: false
        }));
    };

    const handlePauseTimer = () => {
        setIsPaused(true);
        setIsTimerRunning(false);
        setPausedAt(remainingSeconds);
        const currentStored = localStorage.getItem('activity_timer_state');
        if (currentStored) {
            const data = JSON.parse(currentStored);
            localStorage.setItem('activity_timer_state', JSON.stringify({ ...data, isPaused: true, pausedAt: remainingSeconds }));
        }
    };

    const handleResumeTimer = () => {
        if (pausedAt !== null) {
            const now = new Date();
            const newTarget = new Date(now.getTime() + pausedAt * 1000);
            setTargetTime(newTarget);
            setIsTimerRunning(true);
            setIsPaused(false);
            setPausedAt(null);
            const currentStored = localStorage.getItem('activity_timer_state');
            if (currentStored) {
                const data = JSON.parse(currentStored);
                localStorage.setItem('activity_timer_state', JSON.stringify({ ...data, targetTime: newTarget.toISOString(), isPaused: false, pausedAt: null }));
            }
        }
    };

    const handleResetTimer = () => {
        const durationMins = parseInt(plannedDuration) || 25;
        const now = new Date();
        const target = new Date(now.getTime() + durationMins * 60000);
        setTargetTime(target);
        setRemainingSeconds(durationMins * 60);
        setIsTimerRunning(false);
        setIsPaused(true);
        setPausedAt(durationMins * 60);
        setAlarmPlayed(false);
        localStorage.setItem('activity_timer_state', JSON.stringify({
            targetTime: target.toISOString(), type, name, notes, plannedDuration, alarmPlayed: false, isPaused: true, pausedAt: durationMins * 60
        }));
    };

    const handleStopTimer = async () => {
        const plannedMin = Number(plannedDuration);
        const remainingMin = remainingSeconds / 60;
        let actualDurationMinutes = Math.floor(plannedMin - remainingMin);
        actualDurationMinutes = Math.max(1, actualDurationMinutes);

        if (remainingSeconds > 60) {
            const shortfall = Math.ceil(remainingMin);
            const shortfallPercent = Math.round((shortfall / plannedMin) * 100);
            const penaltyPoints = Math.round((shortfall / plannedMin) * 50);
            const confirmed = window.confirm(
                `⚠️ Early Stop Warning!\n\nPlanned: ${plannedMin} minutes\nRemaining: ${shortfall} minutes\nShortfall: ${shortfallPercent}%\n\n📉 RATING PENALTY: -${penaltyPoints} points\n\nThis will hurt your Daily Performance Score.\nAre you sure you want to stop early?`
            );
            if (!confirmed) return;
        }

        try {
            const res = await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, duration: actualDurationMinutes, plannedDuration: plannedMin, name, notes }),
            });
            if (res.ok) {
                fetchActivities();
                localStorage.removeItem('activity_timer_state');
                setName(''); setNotes(''); setPlannedDuration('25');
                setIsTimerRunning(false); setIsPaused(false); setTargetTime(null);
                setRemainingSeconds(0); setAlarmPlayed(false); setPausedAt(null);
                if (document.fullscreenElement) document.exitFullscreen();
            } else {
                const error = await res.json();
                alert(`Failed to log activity: ${error.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Network error. Please check your connection.');
        }
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().then(() => setIsFullScreen(true)).catch((err) => {
                console.error(`Error: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    useEffect(() => {
        const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
    }, []);

    const activityConfig: Record<string, { icon: string; gradient: string; color: string; fillColor: string }> = {
        'STUDY': { icon: '📚', gradient: 'from-blue-500 to-indigo-600', color: 'text-blue-600', fillColor: '#3B82F6' },
        'CODE': { icon: '💻', gradient: 'from-purple-500 to-pink-600', color: 'text-purple-600', fillColor: '#8B5CF6' },
        'EXERCISE': { icon: '💪', gradient: 'from-green-500 to-emerald-600', color: 'text-green-600', fillColor: '#10B981' },
        'READING': { icon: '📖', gradient: 'from-orange-500 to-red-600', color: 'text-orange-600', fillColor: '#F59E0B' },
        'OTHER': { icon: '⭐', gradient: 'from-gray-500 to-slate-600', color: 'text-gray-600', fillColor: '#6B7280' }
    };

    const currentTheme = activityConfig[type] || activityConfig['OTHER'];
    const totalMinutes = activities.reduce((acc, act) => acc + act.duration, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingStatsMinutes = totalMinutes % 60;
    const todayActivities = activities.filter(act => new Date(act.date).toDateString() === new Date().toDateString());
    const todayMinutes = todayActivities.reduce((acc, act) => acc + act.duration, 0);

    const displayMinutes = Math.floor(remainingSeconds / 60);
    const displaySeconds = remainingSeconds % 60;
    const formattedTime = `${displayMinutes} : ${String(displaySeconds).padStart(2, '0')}`;

    const totalSeconds = (parseInt(plannedDuration) || 25) * 60;
    const progress = remainingSeconds / totalSeconds;
    const timerActive = targetTime !== null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                    <span className="text-5xl">⏱️</span>Activity Tracker
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Countdown timer & activity logging (strict mode)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
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

            <div
                ref={containerRef}
                className={`rounded-2xl shadow-sm border p-8 flex flex-col justify-center items-center transition-all duration-500 ${isFullScreen ? 'fixed inset-0 z-50 rounded-none w-full h-full border-0 bg-[#4a1942]' : 'bg-white dark:bg-[#161b22] border-gray-200 dark:border-gray-700'
                    }`}
            >
                {!isFullScreen && (
                    <div className="flex items-center gap-3 mb-6 w-full">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl">⏱️</div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Countdown Timer</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Timer stops automatically at zero</p>
                        </div>
                    </div>
                )}

                {timerActive && (
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative w-64 h-64 mb-8">
                            <svg viewBox="0 0 200 200" className="w-full h-full">
                                <circle cx="100" cy="100" r="90" fill="none" stroke={isFullScreen ? "rgba(255,255,255,0.1)" : "#e5e7eb"} strokeWidth="4" />
                                <defs><clipPath id="circleClip"><circle cx="100" cy="100" r="86" /></clipPath></defs>
                                <rect x="10" y={200 - (progress * 180)} width="180" height={progress * 180} fill={isFullScreen ? "#F59E0B" : currentTheme.fillColor} clipPath="url(#circleClip)" className="transition-all duration-1000 ease-linear" />
                                <circle cx="100" cy="100" r="90" fill="none" stroke={isFullScreen ? "#F59E0B" : currentTheme.fillColor} strokeWidth="4" opacity="0.5" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-xs uppercase tracking-[0.2em] mb-2 font-medium ${isFullScreen ? 'text-white/60' : 'text-gray-400'}`}>
                                    {remainingSeconds === 0 ? 'Complete' : 'Sprint time'}
                                </span>
                                <span className={`text-5xl font-bold tracking-tight ${isFullScreen ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                                    {formattedTime}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                            <button onClick={handleResetTimer} className={`p-4 rounded-full transition-all ${isFullScreen ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`} aria-label="Reset Timer">
                                <RotateCcw size={28} />
                            </button>
                            {remainingSeconds > 0 && (
                                <button onClick={isPaused || !isTimerRunning ? handleResumeTimer : handlePauseTimer} className="w-16 h-16 rounded-full bg-amber-400 hover:bg-amber-500 text-white flex items-center justify-center shadow-xl shadow-amber-400/30 transition-all hover:scale-105 active:scale-95" aria-label={isPaused ? "Resume Timer" : "Pause Timer"}>
                                    {isPaused || !isTimerRunning ? <Play size={28} fill="currentColor" className="ml-1" /> : <Pause size={28} fill="currentColor" />}
                                </button>
                            )}
                            <button onClick={toggleFullScreen} className={`p-4 rounded-full transition-all ${isFullScreen ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`} aria-label="Toggle Fullscreen">
                                {isFullScreen ? <Minimize size={28} /> : <Maximize size={28} />}
                            </button>
                        </div>
                    </div>
                )}

                <div className={`space-y-4 w-full max-w-md ${isFullScreen ? 'bg-white/5 p-6 rounded-2xl backdrop-blur-sm' : ''}`}>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isFullScreen ? 'text-white/70' : 'text-gray-700 dark:text-gray-300'}`}>Activity Type</label>
                        <select className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${isFullScreen ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 dark:bg-[#0d1117] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-amber-500'}`} value={type} onChange={(e) => setType(e.target.value)} disabled={timerActive}>
                            <option value="STUDY">📚 Study</option>
                            <option value="CODE">💻 Code</option>
                            <option value="EXERCISE">💪 Exercise</option>
                            <option value="READING">📖 Reading</option>
                            <option value="OTHER">⭐ Other</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isFullScreen ? 'text-white/70' : 'text-gray-700 dark:text-gray-300'}`}>Planned Duration (minutes)</label>
                        <input className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${isFullScreen ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 dark:bg-[#0d1117] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-amber-500'}`} type="number" min="1" value={plannedDuration} onChange={(e) => setPlannedDuration(e.target.value)} disabled={timerActive} placeholder="e.g., 25" />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isFullScreen ? 'text-white/70' : 'text-gray-700 dark:text-gray-300'}`}>Activity Name (Optional)</label>
                        <input className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${isFullScreen ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 dark:bg-[#0d1117] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-amber-500'}`} type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={timerActive} placeholder="e.g., Calculus homework" />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isFullScreen ? 'text-white/70' : 'text-gray-700 dark:text-gray-300'}`}>Notes (Optional)</label>
                        <textarea className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none resize-none transition-all ${isFullScreen ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 dark:bg-[#0d1117] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-amber-500'}`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={timerActive} placeholder="What did you work on?" />
                    </div>

                    <div className="pt-2">
                        {!timerActive ? (
                            <button onClick={handleStartTimer} className="w-full px-6 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/40 transition-all duration-300 text-lg flex items-center justify-center gap-2">
                                <Play size={20} fill="currentColor" /> Start Countdown
                            </button>
                        ) : (
                            <button onClick={handleStopTimer} className={`w-full px-6 py-4 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-lg flex items-center justify-center gap-2 ${remainingSeconds === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-500/40' : 'bg-gradient-to-r from-red-400 to-orange-500 hover:shadow-red-500/40'}`}>
                                {remainingSeconds === 0 ? <>✅ Log Completed Activity</> : <><Square size={18} fill="currentColor" /> Stop & Log</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>

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
                                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#0d1117] transition-colors">
                                    <div className={`text-3xl bg-gradient-to-br ${config.gradient} rounded-xl p-3 text-white`}>{config.icon}</div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800 dark:text-gray-100">{activity.name || activity.type}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{activity.duration} minutes · {new Date(activity.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</div>
                                    </div>
                                    <div className={`text-2xl font-bold ${config.color}`}>{activity.duration}m</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

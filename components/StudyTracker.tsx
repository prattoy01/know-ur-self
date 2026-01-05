'use client';

import { useState, useEffect, useRef } from 'react';

type Subject = {
    id: string;
    name: string;
    difficulty: number;
};

type Session = {
    id: string;
    subject: { name: string };
    duration: number;
    date: string;
    topics?: string;
};

export default function StudyTracker() {
    const [activeTab, setActiveTab] = useState('TIMER');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    // Timer State
    const [selectedSubject, setSelectedSubject] = useState('');
    const [elapsed, setElapsed] = useState(0); // Seconds
    const [isRunning, setIsRunning] = useState(false);
    const [topics, setTopics] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // New Subject State
    const [newSubjectName, setNewSubjectName] = useState('');
    const [difficulty, setDifficulty] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning]);

    const fetchData = async () => {
        const [subRes, sessRes] = await Promise.all([
            fetch('/api/study/subjects'),
            fetch('/api/study/sessions')
        ]);

        if (subRes.ok) {
            const data = await subRes.json();
            setSubjects(data.subjects);
            if (data.subjects.length > 0 && !selectedSubject) setSelectedSubject(data.subjects[0].id);
        }
        if (sessRes.ok) {
            const data = await sessRes.json();
            setSessions(data.sessions);
        }
        setLoading(false);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStopAndSave = async () => {
        setIsRunning(false);
        const durationMin = Math.ceil(elapsed / 60);
        if (durationMin < 1) return; // Ignore < 1 min

        try {
            const res = await fetch('/api/study/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjectId: selectedSubject, duration: durationMin, topics }),
            });
            if (res.ok) {
                fetchData();
                setElapsed(0);
                setTopics('');
                // Also log as daily activity implicitly? Or separate? 
                // For now, standalone study log. Ideally should sync to Activity log too.
                // We'll leave that as future improvement or add logic here.
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/study/subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newSubjectName, difficulty }),
        });
        if (res.ok) {
            setNewSubjectName('');
            fetchData();
            setActiveTab('TIMER');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                    <span className="text-5xl">📚</span>
                    Study Tracker
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Track your study sessions and manage subjects</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('TIMER')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'TIMER' ? 'bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Timer & Log
                </button>
                <button
                    onClick={() => setActiveTab('SUBJECTS')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'SUBJECTS' ? 'bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Manage Subjects
                </button>
            </div>

            {activeTab === 'TIMER' && (
                <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-200">
                    <div className="text-center mb-8">
                        <div className={`text-7xl font-mono font-bold mb-6 ${isRunning ? 'text-green-500 dark:text-green-400' : 'text-gray-800 dark:text-gray-100'} transition-colors duration-300`}>
                            {formatTime(elapsed)}
                        </div>

                        <div className="flex justify-center gap-4 mb-8">
                            {!isRunning && elapsed === 0 && (
                                <button
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setIsRunning(true)}
                                    disabled={subjects.length === 0}
                                >
                                    Start Session
                                </button>
                            )}
                            {isRunning && (
                                <button
                                    className="px-8 py-4 bg-red-500 text-white rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-red-500/40 transition-all duration-300"
                                    onClick={() => setIsRunning(false)}
                                >
                                    Pause
                                </button>
                            )}
                            {!isRunning && elapsed > 0 && (
                                <>
                                    <button
                                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300"
                                        onClick={() => setIsRunning(true)}
                                    >
                                        Resume
                                    </button>
                                    <button
                                        className="px-8 py-4 bg-green-500 text-white rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-green-500/40 transition-all duration-300"
                                        onClick={handleStopAndSave}
                                    >
                                        Finish
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="max-w-md mx-auto text-left space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Subject</label>
                                <select
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name} (Diff: {sub.difficulty})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topics Covered</label>
                                <input
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
                                    type="text"
                                    value={topics}
                                    onChange={(e) => setTopics(e.target.value)}
                                    placeholder="e.g. Integration by parts"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'SUBJECTS' && (
                <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                            📝
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add New Subject</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Expand your curriculum</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddSubject} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Name</label>
                            <input
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
                                value={newSubjectName}
                                onChange={(e) => setNewSubjectName(e.target.value)}
                                required
                                placeholder="e.g. Linear Algebra"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty (1-10)</label>
                            <input
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
                                type="number"
                                min="1"
                                max="10"
                                value={difficulty}
                                onChange={(e) => setDifficulty(Number(e.target.value))}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
                        >
                            Add Subject
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recent Study Sessions</h2>
                {sessions.length === 0 ? (
                    <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-200">
                        <div className="text-6xl mb-4">📖</div>
                        <p className="text-gray-400">No study sessions logged yet</p>
                        <p className="text-sm text-gray-400 mt-2">Start the timer above to log your first session</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sessions.map(sess => (
                            <div key={sess.id} className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200 group">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    {new Date(sess.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <div className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-500 transition-colors">
                                    {sess.subject.name}
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold mb-3">
                                    <span>⏱</span>
                                    <span>{sess.duration} mins</span>
                                </div>
                                {sess.topics && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3 mt-1">
                                        <span className="font-semibold text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider">Topics:</span><br />
                                        {sess.topics}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

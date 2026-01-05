'use client';

import { useState, useEffect } from 'react';
import CalendarPicker from './CalendarPicker';

type Task = {
    id: string;
    title: string;
    isCompleted: boolean;
    priority: string;
    difficulty: string;
    estimatedDuration: number;
    date: string;
    createdAt: string;
};

export default function DailyPlan() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [estimatedDuration, setEstimatedDuration] = useState('30');
    const [notes, setNotes] = useState('');

    // Date selector
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        // Fix: Use local time construction to match CalendarPicker and avoid UTC shifts
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const fetchTasks = async () => {
        const res = await fetch('/api/tasks');
        if (res.ok) {
            const data = await res.json();
            setTasks(data.tasks);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check for Late Creation Penalty
        const selectedDateObj = new Date(selectedDate);
        // Fix: Use local date string comparison to ensure accuracy
        const today = new Date();
        const isToday = selectedDate === today.toISOString().split('T')[0] ||
            selectedDateObj.toDateString() === today.toDateString();

        if (isToday) {
            const hour = today.getHours();
            if (hour >= 6) {
                let basePenalty = 0;
                if (hour >= 21) basePenalty = 6;      // Late night
                else if (hour >= 9) basePenalty = 4;  // Work day
                else basePenalty = 2;                 // Morning

                const duration = Number(estimatedDuration);
                const weight = duration / 30;
                const totalPenalty = (basePenalty * weight).toFixed(1);

                const confirmed = window.confirm(
                    `⚠️ Late Task Warning!\n\nIt is past 6:00 AM. Creating this task now will incur a weighted penalty of -${totalPenalty} points (Base: -${basePenalty} x Weight: ${weight.toFixed(1)}).\n\nAre you sure you want to proceed?`
                );
                if (!confirmed) return;
            }
        }

        const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                estimatedDuration: Number(estimatedDuration),
                date: selectedDate, // Send selected date to API
                notes
            }),
        });

        if (res.ok) {
            setTitle('');
            setEstimatedDuration('30');
            setNotes('');
            fetchTasks();
        } else {
            const error = await res.json();
            alert(error.error || 'Failed to create task');
        }
    };

    const toggleTask = async (id: string, current: boolean) => {
        const res = await fetch('/api/tasks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isCompleted: !current }),
        });

        if (res.ok) {
            const data = await res.json();
            if (data.warning) {
                // Show warning from API (editing after 6 AM)
                alert(data.warning);
            }
            fetchTasks();
        } else {
            const error = await res.json();
            alert(error.error || 'Failed to update task');
        }
    };

    const deleteTask = async (id: string) => {
        // Find the task to check its date
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        // Parse dates
        const taskDate = new Date(task.date || task.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);

        const isPast = taskDate < today;
        const isToday = taskDate.getTime() === today.getTime();
        const hour = new Date().getHours();

        // RULE 1: Completed tasks - blocked (New Strict Rule)
        if (task.isCompleted) {
            alert('❌ Locked: You cannot delete a completed task!');
            return;
        }

        // RULE 2: Past tasks - blocked
        if (isPast) {
            alert('🔒 Cannot delete past tasks! Past tasks are locked.');
            return;
        }

        // RULE 2: Same-day after 6 AM - warn about penalty
        if (isToday && hour >= 6) {
            const confirmed = window.confirm(
                '⚠️ Warning: Deleting this task will incur a -5 rating penalty.\n\nThis action cannot be undone. Continue?'
            );
            if (!confirmed) return;
        }

        // RULE 3: Future tasks - free to delete (with uncompleted check)
        if (!isToday && !task.isCompleted) {
            const confirmed = window.confirm(
                'Delete this uncompleted future task?\n\n(No penalty applies to future tasks)'
            );
            if (!confirmed) return;
        }

        const res = await fetch('/api/tasks', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            const data = await res.json();
            if (data.warning) {
                // Show the penalty warning from API
                alert(data.warning);
            }
            fetchTasks();
        } else {
            const error = await res.json();
            alert(error.error || 'Failed to delete task');
        }
    };

    // Filter tasks by selected date
    const filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.date || task.createdAt);
        const selectedDateObj = new Date(selectedDate);
        return taskDate.toDateString() === selectedDateObj.toDateString();
    });

    // Check if selected date is today
    const isToday = new Date(selectedDate).toDateString() === new Date().toDateString();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                    <span className="text-5xl">📅</span>
                    Daily Plan
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Organize your day and track your priorities</p>
            </div>

            {/* Add Task Card */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl">
                        ✨
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add New Task</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">What needs to be done today?</p>
                    </div>
                </div>

                <form onSubmit={handleAddTask} className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <input
                            className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Review Calculus, Buy Groceries..."
                            required
                        />
                        <input
                            className="w-24 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
                            type="number"
                            value={estimatedDuration}
                            onChange={(e) => setEstimatedDuration(e.target.value)}
                            placeholder="Min"
                            min="5"
                            required
                        />
                    </div>

                    {/* Custom Calendar Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            📅 Select Date
                        </label>
                        <CalendarPicker
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                        />
                    </div>

                    {/* Notes Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📝 Notes (Optional)
                        </label>
                        <textarea
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 resize-none"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional details..."
                        />
                    </div>

                    <div className="flex justify-end items-center">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-md transform active:scale-95 transition-all text-lg"
                        >
                            Add Task
                        </button>
                    </div>
                </form>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {isToday ? "Today's Tasks" : `Tasks for ${new Date(selectedDate).toLocaleDateString()}`}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {filteredTasks.length === 0 ? (
                    <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-200">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-gray-400">No tasks for this date yet</p>
                        <p className="text-sm text-gray-400 mt-2">Add a task above to get started</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`
                                group bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md
                                ${task.isCompleted ? 'opacity-60 bg-gray-50 dark:bg-[#0d1117]' : ''}
                            `}
                        >
                            <label className="relative flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={task.isCompleted}
                                    onChange={() => toggleTask(task.id, task.isCompleted)}
                                    className="peer w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg checked:bg-green-500 checked:border-green-500 transition-colors appearance-none cursor-pointer"
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity text-sm font-bold">✓</span>
                            </label>

                            <div className="flex-1">
                                <div className={`font-medium text-lg ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                                    {task.title}
                                </div>
                                <div className="flex gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>⏱️ {task.estimatedDuration || 30}m</span>
                                </div>
                            </div>


                            {/* Badges removed to simplify UI - Weight is duration only */}

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label="Delete task"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

'use client';

import { useRouter } from 'next/navigation';
import { X, AlertCircle, Clock } from 'lucide-react';

interface Task {
    id: string;
    name: string;
    duration: number;
    completed: boolean;
}

interface UncompletedTasksPopupProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
}

export default function UncompletedTasksPopup({ isOpen, onClose, tasks }: UncompletedTasksPopupProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const displayTasks = tasks.slice(0, 5);
    const remainingCount = tasks.length - displayTasks.length;
    const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);

    const handleViewPlan = () => {
        router.push('/dashboard/plan');
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Popup */}
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border-2 border-yellow-200 dark:border-yellow-900/30 overflow-hidden">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* Header */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border-b border-yellow-200 dark:border-yellow-900/30 px-6 py-5">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="text-yellow-600 dark:text-yellow-500" size={24} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    Uncompleted Tasks for Today
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    These tasks are still pending and will affect today's rating.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="px-6 py-4 max-h-80 overflow-y-auto">
                        <div className="space-y-3">
                            {displayTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                                >
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {task.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Clock size={14} />
                                            <span>{task.duration} minutes planned</span>
                                            <span className="ml-auto text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-full font-medium">
                                                Not Started
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Overflow Indicator */}
                        {remainingCount > 0 && (
                            <button
                                onClick={handleViewPlan}
                                className="mt-3 w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                            >
                                +{remainingCount} more uncompleted task{remainingCount !== 1 ? 's' : ''}
                            </button>
                        )}
                    </div>

                    {/* Rating Impact Warning */}
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span>
                                Uncompleted tasks ({totalDuration} min total) will reduce today's rating after day end.
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                        <button
                            onClick={handleViewPlan}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm hover:shadow-md"
                        >
                            View Daily Plan
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors"
                        >
                            Continue to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

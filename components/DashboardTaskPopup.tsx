'use client';

import { useEffect, useState } from 'react';
import UncompletedTasksPopup from './UncompletedTasksPopup';

interface Task {
    id: string;
    name: string;
    duration: number;
    completed: boolean;
    date: string;
}

export default function DashboardTaskPopup() {
    const [showPopup, setShowPopup] = useState(false);
    const [uncompletedTasks, setUncompletedTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAndShowPopup = async () => {
            // Check if popup was dismissed today
            const today = new Date().toISOString().split('T')[0];
            const dismissKey = `dismissedTaskPopup_${today}`;
            const wasDismissed = localStorage.getItem(dismissKey);

            if (wasDismissed) {
                setLoading(false);
                return;
            }

            // Fetch today's tasks
            try {
                const res = await fetch('/api/tasks');
                if (res.ok) {
                    const data = await res.json();
                    const tasks = data.tasks || [];

                    // Filter for uncompleted tasks TODAY only
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const uncompleted = tasks.filter((task: Task) => {
                        const taskDate = new Date(task.date);
                        taskDate.setHours(0, 0, 0, 0);

                        return (
                            taskDate.getTime() === today.getTime() && // Today only
                            !task.completed                            // Not completed
                        );
                    });

                    // Sort by duration (highest first - most important)
                    uncompleted.sort((a: Task, b: Task) => b.duration - a.duration);

                    setUncompletedTasks(uncompleted);

                    // Show popup only if there are uncompleted tasks
                    if (uncompleted.length > 0) {
                        setShowPopup(true);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch tasks:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAndShowPopup();
    }, []);

    const handleClose = () => {
        // Mark as dismissed for today
        const today = new Date().toISOString().split('T')[0];
        const dismissKey = `dismissedTaskPopup_${today}`;
        localStorage.setItem(dismissKey, 'true');
        setShowPopup(false);
    };

    if (loading) return null;

    return (
        <UncompletedTasksPopup
            isOpen={showPopup}
            onClose={handleClose}
            tasks={uncompletedTasks}
        />
    );
}

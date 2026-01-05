'use client';

import { useState } from 'react';

interface CalendarPickerProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
}

export default function CalendarPicker({ selectedDate, onDateSelect }: CalendarPickerProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isExpanded, setIsExpanded] = useState(false);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust to start Monday

        return { daysInMonth, startingDayOfWeek };
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        clickedDate.setHours(0, 0, 0, 0);

        // Allow selecting today or future dates, block only past dates
        if (clickedDate >= today) {
            // Fix: Use local time to avoid timezone offset issues (off-by-one bug)
            const year = clickedDate.getFullYear();
            const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(clickedDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${dayStr}`;

            onDateSelect(dateString);
            setIsExpanded(false); // Collapse after selection
        }
    };

    const handleToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const dayStr = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;

        onDateSelect(dateString);
        setCurrentMonth(today);
        setIsExpanded(false);
    };

    const isSelectedDate = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateString = date.toISOString().split('T')[0];
        return dateString === selectedDate;
    };

    const isToday = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isPastDate = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date < today;
    };

    const renderCalendarDays = () => {
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = isSelectedDate(day);
            const isTodayDate = isToday(day);
            const isPast = isPastDate(day);

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    disabled={isPast}
                    className={`
                        h-10 rounded flex items-center justify-center text-base font-medium transition-all
                        ${isSelected
                            ? 'bg-blue-500 text-white'
                            : isTodayDate
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : isPast
                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                    `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    // Format selected date for display
    const formatDisplayDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    return (
        <div className="relative">
            {/* Collapsed Date Input */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 hover:border-blue-500 transition-all"
            >
                <span className="font-medium">{formatDisplayDate(selectedDate)}</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                </svg>
            </button>

            {/* Expanded Calendar */}
            {isExpanded && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#161b22] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNextMonth}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Days of week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {daysOfWeek.map((day, idx) => (
                            <div key={idx} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1 mb-3">
                        {renderCalendarDays()}
                    </div>

                    {/* Today button */}
                    <button
                        onClick={handleToday}
                        className="w-full py-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded font-medium transition-colors"
                    >
                        Today
                    </button>
                </div>
            )}
        </div>
    );
}

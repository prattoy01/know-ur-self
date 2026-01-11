"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Maximize, Minimize } from "lucide-react";

interface CountdownTimerProps {
    initialMinutes?: number;
    initialSeconds?: number;
    color?: "violet" | "amber" | "blue" | "emerald" | "rose";
}

const colorMap = {
    violet: { text: "text-violet-500", bg: "bg-violet-500", shadow: "shadow-violet-500/30" },
    amber: { text: "text-amber-400", bg: "bg-amber-400", shadow: "shadow-amber-400/30" },
    blue: { text: "text-blue-500", bg: "bg-blue-500", shadow: "shadow-blue-500/30" },
    emerald: { text: "text-emerald-500", bg: "bg-emerald-500", shadow: "shadow-emerald-500/30" },
    rose: { text: "text-rose-500", bg: "bg-rose-500", shadow: "shadow-rose-500/30" },
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({
    initialMinutes = 25,
    initialSeconds = 0,
    color = "violet",
}) => {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60 + initialSeconds);
    const [isActive, setIsActive] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [duration, setDuration] = useState(initialMinutes * 60 + initialSeconds);
    const containerRef = useRef<HTMLDivElement>(null);

    const theme = colorMap[color] || colorMap.violet;

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(duration);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().then(() => {
                setIsFullScreen(true);
            }).catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    // Sync fullscreen state if user exits via ESC
    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
    }, []);

    // Calculate progress for SVG circle
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / duration;
    const dashoffset = circumference - progress * circumference;

    return (
        <div
            ref={containerRef}
            className={`flex flex-col items-center justify-center p-8 transition-colors duration-500 ${isFullScreen ? "bg-[#4a0e4e] text-white w-full h-full" : "bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md mx-auto aspect-square ring-1 ring-slate-100 dark:ring-slate-800"
                }`}
        >
            <div className="relative mb-8 group cursor-default">
                {/* SVG Circle */}
                <svg className="w-80 h-80 transform -rotate-90">
                    <circle
                        cx="160"
                        cy="160"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-100 dark:text-slate-800"
                    />
                    <circle
                        cx="160"
                        cy="160"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round"
                        className={`${theme.text} transition-all duration-1000 ease-linear`}
                    />
                </svg>

                {/* Time Display */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                    <span className={`text-sm uppercase tracking-widest mb-4 font-medium ${isFullScreen ? 'text-white/60' : 'text-slate-400'}`}>Sprint Time</span>
                    <h1 className={`text-7xl font-bold font-mono tracking-tighter ${isFullScreen ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {formatTime(timeLeft)}
                    </h1>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                <button
                    onClick={resetTimer}
                    className={`p-4 rounded-full transition-colors ${isFullScreen
                            ? 'text-white/70 hover:bg-white/10'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    aria-label="Reset Timer"
                >
                    <RotateCcw size={24} />
                </button>

                <button
                    onClick={toggleTimer}
                    className={`p-6 rounded-full ${theme.bg} hover:opacity-90 transition-all shadow-lg ${theme.shadow} text-white transform hover:scale-105 active:scale-95`}
                    aria-label={isActive ? "Pause Timer" : "Start Timer"}
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>

                <button
                    onClick={toggleFullScreen}
                    className={`p-4 rounded-full transition-colors ${isFullScreen
                            ? 'text-white/70 hover:bg-white/10'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    aria-label="Toggle Fullscreen"
                >
                    {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
                </button>
            </div>
        </div>
    );
};

export default CountdownTimer;

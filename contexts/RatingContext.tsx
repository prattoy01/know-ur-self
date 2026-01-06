'use client';

/**
 * RATING CONTEXT
 * 
 * Provides shared rating state across all UI components.
 * This is the ONLY way components should access rating data.
 * 
 * Key Principles:
 * - No local rating calculations in UI
 * - All state comes from this context
 * - Polling for real-time updates
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface DPSBreakdown {
    studyScore: number;
    planScore: number;
    budgetScore: number;
    activityScore: number;
    disciplinePenalty: number;
    relativeAdjustment: number;
    totalDPS: number;
}

interface RatingHistoryEntry {
    id: string;
    date: string;
    oldRating: number;
    newRating: number;
    change: number;
    dps: number;
    breakdown: DPSBreakdown;
    status: 'LIVE' | 'LOCKED';
    reason?: string;
}

interface RatingState {
    currentRating: number;
    tier: string;
    tierColor: string;
    todayDelta: number;
    todayDPS: DPSBreakdown;
    liveEntry: RatingHistoryEntry | null;
    baseRating: number;
}

interface RatingContextValue {
    state: RatingState | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    lastUpdated: Date | null;
}

const RatingContext = createContext<RatingContextValue | undefined>(undefined);

interface RatingProviderProps {
    children: ReactNode;
    pollingInterval?: number; // in milliseconds
}

export function RatingProvider({ children, pollingInterval = 5000 }: RatingProviderProps) {
    const [state, setState] = useState<RatingState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchState = useCallback(async () => {
        try {
            const res = await fetch('/api/rating/state');
            if (!res.ok) {
                throw new Error('Failed to fetch rating state');
            }
            const data = await res.json();
            if (data.state) {
                setState(data.state);
                setLastUpdated(new Date());
                setError(null);
            }
        } catch (err) {
            console.error('Rating state fetch error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchState();
    }, [fetchState]);

    // Polling for real-time updates
    useEffect(() => {
        if (pollingInterval <= 0) return;

        const interval = setInterval(fetchState, pollingInterval);
        return () => clearInterval(interval);
    }, [fetchState, pollingInterval]);

    const value: RatingContextValue = {
        state,
        loading,
        error,
        refresh: fetchState,
        lastUpdated
    };

    return (
        <RatingContext.Provider value={value}>
            {children}
        </RatingContext.Provider>
    );
}

export function useRating(): RatingContextValue {
    const context = useContext(RatingContext);
    if (context === undefined) {
        throw new Error('useRating must be used within a RatingProvider');
    }
    return context;
}

// Helper hook for components that just need the current rating
export function useCurrentRating() {
    const { state, loading } = useRating();
    return {
        rating: state?.currentRating ?? null,
        tier: state?.tier ?? null,
        tierColor: state?.tierColor ?? null,
        loading
    };
}

// Helper hook for components that need today's delta
export function useTodayDelta() {
    const { state, loading } = useRating();
    return {
        delta: state?.todayDelta ?? 0,
        dps: state?.todayDPS ?? null,
        loading
    };
}

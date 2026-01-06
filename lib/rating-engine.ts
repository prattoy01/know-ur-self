/**
 * UNIFIED RATING ENGINE
 * 
 * Single source of truth for all rating calculations.
 * All rating changes MUST go through this engine.
 * 
 * Key Principles:
 * 1. No page, component, or API directly modifies rating
 * 2. One entry per day per user (enforced)
 * 3. LIVE entries can be updated, LOCKED entries are immutable
 * 4. All UI components subscribe to the same state
 */

import { prisma } from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

export type RatingEventType =
    | 'TASK_CREATE'
    | 'TASK_COMPLETE'
    | 'TASK_UNCOMPLETE'
    | 'TASK_DELETE'
    | 'ACTIVITY_LOGGED'
    | 'EXPENSE_LOGGED'
    | 'STUDY_LOGGED'
    | 'DAY_FINALIZE'
    | 'REFRESH'; // For page loads, no mutation

export interface RatingEvent {
    type: RatingEventType;
    userId: string;
    metadata?: Record<string, any>;
}

export interface DPSBreakdown {
    studyScore: number;
    planScore: number;
    budgetScore: number;
    activityScore: number;
    disciplinePenalty: number;
    relativeAdjustment: number;
    totalDPS: number;
}

export interface RatingHistoryEntry {
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

export interface RatingState {
    currentRating: number;
    tier: string;
    tierColor: string;
    todayDelta: number;
    todayDPS: DPSBreakdown;
    liveEntry: RatingHistoryEntry | null;
    baseRating: number; // Rating at start of day
}

// ============================================
// CONSTANTS
// ============================================

export const TIERS = [
    { name: 'Unrated', min: -Infinity, color: '#6b7280' },
    { name: 'Newbie', min: 0, color: '#6b7280' },
    { name: 'Pupil', min: 1200, color: '#22c55e' },
    { name: 'Specialist', min: 1400, color: '#06b6d4' },
    { name: 'Expert', min: 1600, color: '#3b82f6' },
    { name: 'Candidate Master', min: 1900, color: '#a855f7' },
    { name: 'Master', min: 2100, color: '#f97316' },
    { name: 'International Master', min: 2300, color: '#f97316' },
    { name: 'Grandmaster', min: 2400, color: '#ef4444' },
    { name: 'Legendary', min: 3000, color: '#dc2626' }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTier(rating: number): { name: string; color: string } {
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (rating >= TIERS[i].min) {
            return TIERS[i];
        }
    }
    return TIERS[0];
}

function getStartOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getEndOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

// ============================================
// DPS CALCULATION (Strict)
// ============================================

async function calculateDPS(userId: string, date: Date = new Date()): Promise<DPSBreakdown> {
    const startOfDay = getStartOfDay(date);
    const endOfDay = getEndOfDay(date);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // 1. PLAN SCORE & DISCIPLINE PENALTY
    const tasksAll = await prisma.task.findMany({
        where: { userId, createdAt: { gte: startOfDay, lte: endOfDay } }
    });
    const activeTasks = tasksAll.filter(t => !t.deletedAt);
    const deletedTasks = tasksAll.filter(t => t.deletedAt);

    let planScore = 0;
    let disciplinePenalty = 0;

    // No plan penalty
    if (tasksAll.length === 0) {
        disciplinePenalty -= 50;
    } else {
        // Creation penalties (weighted by duration)
        for (const t of tasksAll) {
            const hour = t.createdAt.getHours();
            const duration = t.estimatedDuration || 30;
            const weight = duration / 30;

            let basePenalty = 0;
            if (hour >= 21) basePenalty = -6;
            else if (hour >= 9) basePenalty = -4;
            else if (hour >= 6) basePenalty = -2;

            disciplinePenalty += basePenalty * weight;
        }
    }

    // Deletion penalties
    for (const t of deletedTasks) {
        if (!t.deletedAt) continue;
        const delHour = t.deletedAt.getHours();
        const duration = t.estimatedDuration || 30;
        const weight = duration / 30;
        const basePenalty = delHour >= 6 ? -5 : -2;
        disciplinePenalty += basePenalty * weight;
    }

    // Completion score (time-based)
    if (activeTasks.length > 0) {
        const totalMinutes = activeTasks.reduce((sum, t) => sum + (t.estimatedDuration || 30), 0);
        const completedMinutes = activeTasks
            .filter(t => t.isCompleted)
            .reduce((sum, t) => sum + (t.estimatedDuration || 30), 0);
        const completionRate = totalMinutes > 0 ? completedMinutes / totalMinutes : 0;
        planScore = Math.round((completionRate * 50) - 25);
    }

    // 2. STUDY SCORE
    const goalMinutes = (user.dailyStudyGoal || 2) * 60;
    const studySessions = await prisma.studySession.findMany({
        where: { userId, date: { gte: startOfDay, lte: endOfDay } }
    });
    const studyMinutes = studySessions.reduce((acc, s) => acc + s.duration, 0);

    let studyScore = 0;
    if (studyMinutes >= goalMinutes) {
        studyScore = 30;
    } else {
        const ratio = studyMinutes / goalMinutes;
        studyScore = Math.round((ratio * 60) - 30);
    }

    // 3. ACTIVITY SCORE
    const activities = await prisma.activity.findMany({
        where: { userId, date: { gte: startOfDay, lte: endOfDay } }
    });

    let activityScore = 0;
    for (const act of activities) {
        if (act.plannedDuration > 0) {
            const ratio = Math.min(1, act.duration / act.plannedDuration);
            if (ratio < 1) {
                activityScore -= (1 - ratio) * 10;
            } else {
                activityScore += 2;
            }
        } else {
            activityScore += 1;
        }
    }
    activityScore = Math.min(20, Math.max(-30, activityScore));

    // 4. BUDGET SCORE
    const budget = await prisma.budget.findFirst({ where: { userId } });
    let budgetScore = 0;

    if (budget) {
        let dailyLimit = budget.amount;
        if (budget.type === 'WEEKLY') dailyLimit /= 7;
        if (budget.type === 'MONTHLY') dailyLimit /= 30;

        const expenses = await prisma.expense.findMany({
            where: { userId, date: { gte: startOfDay, lte: endOfDay } }
        });
        const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);

        if (totalSpent > dailyLimit && dailyLimit > 0) {
            const percentageOver = (totalSpent - dailyLimit) / dailyLimit;
            budgetScore = Math.round(20 - (percentageOver * 50));
        } else {
            budgetScore = 20;
        }
    }

    // 5. RELATIVE ADJUSTMENT (vs 7-day avg)
    const history = await prisma.ratingHistory.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 7
    });

    let relativeAdjustment = 0;
    const rawDPS = planScore + studyScore + activityScore + budgetScore + disciplinePenalty;

    if (history.length > 0) {
        const avgPerformance = history.reduce((acc, h) => acc + (h.change || 0), 0) / history.length;
        relativeAdjustment = Math.round((rawDPS - avgPerformance) * 0.1);
    }

    // 6. TOTAL DPS (clamped to ±200)
    const totalDPS = Math.max(-200, Math.min(200, rawDPS + relativeAdjustment));

    return {
        studyScore,
        planScore,
        budgetScore,
        activityScore,
        disciplinePenalty,
        relativeAdjustment,
        totalDPS
    };
}

// ============================================
// RATING ENGINE CLASS
// ============================================

export class RatingEngine {
    /**
     * Process any rating-affecting event
     * This is the ONLY way to modify rating
     */
    static async processEvent(event: RatingEvent): Promise<RatingState> {
        const { type, userId } = event;

        // For REFRESH events, just return current state without mutation
        if (type === 'REFRESH') {
            return this.getState(userId);
        }

        // For DAY_FINALIZE, handle specially
        if (type === 'DAY_FINALIZE') {
            await this.finalizeDay(userId, new Date());
            return this.getState(userId);
        }

        // All other events: recalculate and update
        return this.recalculateAndUpdate(userId);
    }

    /**
     * Get current rating state (for page loads)
     */
    static async getState(userId: string): Promise<RatingState> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        const today = getStartOfDay();
        const dps = await calculateDPS(userId, today);

        // Find or calculate base rating
        const lastLockedEntry = await prisma.ratingHistory.findFirst({
            where: { userId, status: 'LOCKED' },
            orderBy: { date: 'desc' }
        });
        const baseRating = lastLockedEntry?.newRating || 1000;

        // Get today's LIVE entry if exists
        const liveEntry = await prisma.ratingHistory.findFirst({
            where: {
                userId,
                date: { gte: today, lte: getEndOfDay(today) },
                status: 'LIVE'
            }
        });

        const todayDelta = user.rating - baseRating;
        const tier = getTier(user.rating);

        return {
            currentRating: user.rating,
            tier: tier.name,
            tierColor: tier.color,
            todayDelta,
            todayDPS: dps,
            baseRating,
            liveEntry: liveEntry ? {
                id: liveEntry.id,
                date: liveEntry.date.toISOString(),
                oldRating: liveEntry.oldRating,
                newRating: liveEntry.newRating,
                change: liveEntry.change,
                dps: liveEntry.dps,
                breakdown: JSON.parse(liveEntry.breakdown),
                status: liveEntry.status as 'LIVE' | 'LOCKED',
                reason: liveEntry.reason || undefined
            } : null
        };
    }

    /**
     * Recalculate rating and update database
     * Called after any rating-affecting action
     */
    private static async recalculateAndUpdate(userId: string): Promise<RatingState> {
        const today = getStartOfDay();
        const dps = await calculateDPS(userId, today);

        // Find base rating (last LOCKED entry or default)
        const lastLockedEntry = await prisma.ratingHistory.findFirst({
            where: { userId, status: 'LOCKED' },
            orderBy: { date: 'desc' }
        });
        const baseRating = lastLockedEntry?.newRating || 1000;

        // Calculate new rating
        const newRating = Math.max(400, Math.min(2500, baseRating + dps.totalDPS));
        const tier = getTier(newRating);

        // Update user rating
        await prisma.user.update({
            where: { id: userId },
            data: {
                rating: newRating,
                rank: tier.name,
                lastActiveDate: new Date()
            }
        });

        // Upsert today's LIVE entry (one per day)
        const existingLive = await prisma.ratingHistory.findFirst({
            where: {
                userId,
                date: { gte: today, lte: getEndOfDay(today) }
            }
        });

        let liveEntry: any;
        if (existingLive) {
            liveEntry = await prisma.ratingHistory.update({
                where: { id: existingLive.id },
                data: {
                    newRating,
                    change: newRating - baseRating,
                    dps: dps.totalDPS,
                    breakdown: JSON.stringify(dps),
                    reason: 'Live Update'
                }
            });
        } else {
            liveEntry = await prisma.ratingHistory.create({
                data: {
                    userId,
                    date: today,
                    status: 'LIVE',
                    oldRating: baseRating,
                    newRating,
                    change: newRating - baseRating,
                    dps: dps.totalDPS,
                    breakdown: JSON.stringify(dps),
                    reason: 'Live Update'
                }
            });
        }

        return {
            currentRating: newRating,
            tier: tier.name,
            tierColor: tier.color,
            todayDelta: newRating - baseRating,
            todayDPS: dps,
            baseRating,
            liveEntry: {
                id: liveEntry.id,
                date: liveEntry.date.toISOString(),
                oldRating: liveEntry.oldRating,
                newRating: liveEntry.newRating,
                change: liveEntry.change,
                dps: liveEntry.dps,
                breakdown: dps,
                status: 'LIVE',
                reason: liveEntry.reason
            }
        };
    }

    /**
     * Finalize a day (lock it forever)
     * Called at end of day or when first action of new day happens
     */
    static async finalizeDay(userId: string, date: Date): Promise<void> {
        const dayStart = getStartOfDay(date);
        const dayEnd = getEndOfDay(date);

        // Find LIVE entry for that day
        const liveEntry = await prisma.ratingHistory.findFirst({
            where: {
                userId,
                date: { gte: dayStart, lte: dayEnd },
                status: 'LIVE'
            }
        });

        if (liveEntry) {
            // Lock it
            await prisma.ratingHistory.update({
                where: { id: liveEntry.id },
                data: { status: 'LOCKED' }
            });
        }
    }

    /**
     * Check if we need to finalize previous days
     * Called on any user action
     */
    static async checkAndFinalizePastDays(userId: string): Promise<void> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return;

        const today = getStartOfDay();
        const lastActive = getStartOfDay(user.lastActiveDate);

        // If last active was before today, finalize those days
        if (lastActive < today) {
            // Find all LIVE entries before today and lock them
            await prisma.ratingHistory.updateMany({
                where: {
                    userId,
                    status: 'LIVE',
                    date: { lt: today }
                },
                data: { status: 'LOCKED' }
            });

            // Handle inactivity decay for gap days
            const diffTime = today.getTime() - lastActive.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                const decay = (diffDays - 1) * 10;
                const lastRating = user.rating;
                const newRating = Math.max(400, lastRating - decay);

                // Create decay entry
                await prisma.ratingHistory.create({
                    data: {
                        userId,
                        date: today,
                        status: 'LOCKED',
                        oldRating: lastRating,
                        newRating,
                        change: -decay,
                        dps: 0,
                        breakdown: JSON.stringify({ reason: 'Inactivity Decay', days: diffDays - 1 }),
                        reason: `Inactivity Penalty (${diffDays - 1} days)`
                    }
                });

                await prisma.user.update({
                    where: { id: userId },
                    data: { rating: newRating }
                });
            }
        }
    }
}

// Export for backward compatibility
export { calculateDPS };

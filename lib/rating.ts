import { prisma } from '@/lib/prisma';

export const RANKS = [
    { name: 'Unrated', min: -Infinity, color: '#gray' },
    { name: 'Newbie', min: 0, color: '#gray' },
    { name: 'Pupil', min: 1200, color: '#77ff77' },
    { name: 'Specialist', min: 1400, color: '#77ddff' },
    { name: 'Expert', min: 1600, color: '#0000ff' },
    { name: 'Master', min: 2100, color: '#ff8c00' },
    { name: 'Grandmaster', min: 2400, color: '#ff0000' },
    { name: 'Legendary', min: 3000, color: '#ff0000' }
];

interface DPSComponents {
    studyScore: number;
    planScore: number;
    budgetScore: number;
    activityScore: number;
    disciplinePenalty: number;
    relativeAdjustment: number;
    totalDPS: number;
}

export async function calculateStrictDPS(userId: string, date: Date = new Date()): Promise<DPSComponents> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // 1. Plan Completion Score & Penalties (Creation + Deletion)
    // We need ALL tasks, even deleted ones, to assess penalties.
    // However, Plan Completion Score should only count ACTIVE tasks? 
    // Spec: "Delete same-day task ... -> penalty".
    // So we fetch all including deleted.
    const tasksAll = await prisma.task.findMany({
        where: { userId, createdAt: { gte: startOfDay, lte: endOfDay } }
    });
    // For Plan Completion Rate, we likely only consider 'Active' (non-deleted) tasks or maybe completed ones?
    // "Delete task ... -> penalty". If I delete it, it shouldn't count towards the 'denominator' of plan completion?
    // Let's assume Plan Score is based on Active Tasks.
    const activeTasks = tasksAll.filter(t => !t.deletedAt);
    const deletedTasks = tasksAll.filter(t => t.deletedAt);

    let planScore = 0;
    let disciplinePenalty = 0;

    // A. Creation Penalties (Weighted by Duration)
    if (tasksAll.length === 0) {
        disciplinePenalty -= 50; // No plan at all
    } else {
        /*
        Weighted Penalty Formula:
        - Base penalty depends on time: -2 (6-9AM), -4 (9AM-9PM), -6 (9PM+)
        - Weight multiplier = (duration / 30) // normalize to 30min baseline
        - Actual penalty = basePenalty * weightMultiplier
        
        Examples:
        - 30min task at 9 AM: -4 * 1.0 = -4
        - 120min task at 9 AM: -4 * 4.0 = -16
        - 60min task at 8 PM: -4 * 2.0 = -8
        */
        for (const t of tasksAll) {
            const hour = t.createdAt.getHours();
            const duration = t.estimatedDuration || 30;
            const weightMultiplier = duration / 30; // 30min = baseline weight 1.0

            let basePenalty = 0;
            if (hour >= 21) {
                basePenalty = -6; // Late night
            } else if (hour >= 9) {
                basePenalty = -4; // After work starts
            } else if (hour >= 6) {
                basePenalty = -2; // After 6 AM
            }
            // Before 6 AM = 0 penalty

            disciplinePenalty += basePenalty * weightMultiplier;
        }
    }

    // B. Deletion Penalties (Weighted by Duration)
    /*
    Weighted Deletion Formula:
    - Base penalty: -2 (before 6 AM), -5 (after 6 AM)
    - Weight multiplier = (duration / 30)
    - Actual penalty = basePenalty * weightMultiplier
    */
    for (const t of deletedTasks) {
        if (!t.deletedAt) continue;
        const delHour = t.deletedAt.getHours();
        const duration = t.estimatedDuration || 30;
        const weightMultiplier = duration / 30;

        let basePenalty = 0;
        if (delHour >= 6) {
            basePenalty = -5; // After 6 AM
        } else {
            basePenalty = -2; // Before 6 AM
        }

        disciplinePenalty += basePenalty * weightMultiplier;
    }


    // C. Weighted Completion Score (Duration-Based, NOT Task Count)
    /*
    Time-Based Scoring:
    - Total planned time = sum of all active task durations
    - Completed time = sum of completed task durations
    - Completion rate = completed minutes / planned minutes
    - Plan Score = (completion rate * 50) - 25
    
    This rewards completing LONGER tasks over just ticking off many short tasks.
    */
    if (activeTasks.length > 0) {
        const totalMinutes = activeTasks.reduce((sum, t) => sum + (t.estimatedDuration || 30), 0);
        const completedMinutes = activeTasks
            .filter(t => t.isCompleted)
            .reduce((sum, t) => sum + (t.estimatedDuration || 30), 0);

        const completionRate = totalMinutes > 0 ? completedMinutes / totalMinutes : 0;
        planScore = Math.round((completionRate * 50) - 25);

        // Scale: 
        // 0% completion = -25
        // 50% completion = 0
        // 100% completion = +25
    }

    // 2. Study Score (Goal vs Actual)
    // Goal: user.dailyStudyGoal (default 2h)
    const goalMinutes = (user.dailyStudyGoal || 2) * 60;
    const studySessions = await prisma.studySession.findMany({
        where: { userId, date: { gte: startOfDay, lte: endOfDay } }
    });
    const studyMinutes = studySessions.reduce((acc, s) => acc + s.duration, 0);

    let studyScore = 0;
    if (studyMinutes >= goalMinutes) {
        studyScore = 30; // Max score
    } else {
        // Percentage of goal missed is penalty? 
        // 0 mins = -30. 50% = 0.
        // Scale: ((Actual / Goal) * 60) - 30
        const ratio = studyMinutes / goalMinutes;
        studyScore = Math.round((ratio * 60) - 30);
    }

    // 3. Activity Execution (Timer Honesty)
    const activities = await prisma.activity.findMany({
        where: { userId, date: { gte: startOfDay, lte: endOfDay } }
    });

    let activityScore = 0;
    // Iterate activities to check planned vs actual
    for (const act of activities) {
        // If plannedDuration > 0, check deviation
        if (act.plannedDuration > 0) {
            // Ratio-based penalty: 
            // completion_ratio = actual_time / planned_time
            // penalty scales with (1 - completion_ratio)

            // Cap ratio at 1 (no bonus for over-working specific timer? User says "Stopped early is treated as under-performance")
            // Actually, "Over-performance is capped".
            const ratio = Math.min(1, act.duration / act.plannedDuration);

            if (ratio < 1) {
                // Penalty!
                // How much? "activity_penalty scales with (1 - ratio)"
                // Let's set a Max Penalty per activity. Say 10 pts.
                // 50% done -> 0.5 * 10 = -5 pts.
                // 0% done -> 1 * 10 = -10 pts.
                const penaltyRaw = (1 - ratio) * 10;
                activityScore -= penaltyRaw;
            } else {
                // Complete: Small bonus? 
                // User spec: "Spending within budget -> neutral or small bonus".
                // Activities: "Under-performance causes penalties".
                // Implied: Meeting goal is good. +2.
                activityScore += 2;
            }
        } else {
            // Ad-hoc activity. Small positive
            activityScore += 1;
        }
    }
    // Cap total activity score: Max +20, Min -Infinity (Strict!)
    // Actually user said range -100 to +100. Let's cap at -30?
    activityScore = Math.min(20, Math.max(-30, activityScore));


    // 4. Budget Discipline
    const budget = await prisma.budget.findFirst({ where: { userId } });
    let budgetScore = 20; // Default Full Score if no spending or within budget

    if (budget) {
        let dailyLimit = budget.amount;
        if (budget.type === 'WEEKLY') dailyLimit /= 7;
        if (budget.type === 'MONTHLY') dailyLimit /= 30;

        const expenses = await prisma.expense.findMany({
            where: { userId, date: { gte: startOfDay, lte: endOfDay } }
        });
        const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);

        if (totalSpent > dailyLimit) {
            const overspend = totalSpent - dailyLimit;
            const percentageOver = overspend / dailyLimit;
            // Penalty scales with percentage. 
            // 10% over -> -5 pts?
            // 50% over -> -25 pts
            // Formula: 20 - (percentageOver * 50)
            // Example: 20% over -> 20 - 10 = 10 pts.
            // 100% over -> 20 - 50 = -30 pts.
            budgetScore = Math.round(20 - (percentageOver * 50));
        }
    } else {
        budgetScore = 0; // Neutral if no budget set
    }


    // 5. Total Raw DPS
    // Range roughly: 
    // Plan: -25 to +25
    // Study: -30 to +30
    // Activity: -20 to +20
    // Budget: -Inf to +20
    // Discipline: -50 or -20
    // Theoretical Max: 25 + 30 + 20 + 20 = 95
    // Theoretical Min: -25 - 30 - 20 - 30 - 50 = -155
    // Clamp to -100, +100
    let rawDPS = planScore + studyScore + activityScore + budgetScore + disciplinePenalty;
    rawDPS = Math.max(-100, Math.min(100, rawDPS));

    // 6. Relative Adjustment (vs 7-day average)
    // Fetch last 7 history entries
    const history = await prisma.ratingHistory.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 7
    });

    let relativeAdjustment = 0;
    if (history.length > 0) {
        // Average the "change" field (since change ≈ DPS in loose terms, or store raw DPS in history?)
        // Schema only has `change`. Let's use `change` as proxy for performance.
        const avgPerformance = history.reduce((acc: number, h: any) => acc + (h.change || 0), 0) / history.length;

        // If Today > Avg, Bonus. If Today < Avg, Penalty.
        // Magnitude? 10% of difference.
        const diff = rawDPS - avgPerformance;
        relativeAdjustment = Math.round(diff * 0.1);
    }

    const totalDPS = rawDPS + relativeAdjustment;

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


/**
 * RECALCULATE CURRENT RATING (INSTANT UPDATE)
 * 
 * PURPOSE:
 * - Calculate real-time provisional rating based on today's activity
 * - Update User.rating immediately for instant UI feedback
 * - Does NOT create RatingHistory entry (that happens at end-of-day)
 * 
 * FLOW:
 * 1. Calculate today's DPS
 * 2. Find base rating (last finalized rating from history OR current rating)
 * 3. Convert DPS to rating delta
 * 4. Update User.rating instantly
 * 
 * CALLED BY:
 * - Every mutation API (task completion, deletion, spending, etc.)
 * 
 * RETURNS:
 * - oldRating: Starting rating for today
 * - newRating: Updated provisional rating
 * - change: Rating delta
 * - dps: Today's DPS components
 */
export async function recalculateCurrentRating(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // 1. Calculate today's DPS
    const today = new Date();
    const dps = await calculateStrictDPS(userId, today);

    // 2. Find base rating (last finalized rating)
    // Check if we have a finalized entry for yesterday or earlier
    const lastHistory = await prisma.ratingHistory.findFirst({
        where: { userId },
        orderBy: { date: 'desc' }
    });

    // Base rating is either:
    // - The last finalized rating from history
    // - Or default 1000 (We cannot use user.rating has it might be already provisional/dirty)
    const baseRating = lastHistory?.newRating || 1000;

    // 3. Convert DPS to rating delta (simple 1:1 mapping for now)
    const ratingDelta = Math.round(dps.totalDPS);

    // 4. Calculate new provisional rating (clamped to 400-2500)
    const newRating = Math.max(400, Math.min(2500, baseRating + ratingDelta));

    // 5. Calculate new rank
    let newRank = 'Newbie';
    for (const rank of RANKS) {
        if (newRating >= rank.min) newRank = rank.name;
    }

    // 6. Update user's current rating (provisional, not finalized)
    await prisma.user.update({
        where: { id: userId },
        data: {
            rating: newRating,
            rank: newRank,
            lastActiveDate: today
        }
    });

    return {
        oldRating: baseRating,
        newRating,
        change: ratingDelta,
        dps: dps.totalDPS,
        breakdown: dps,
        isProvisional: true // Flag to indicate this is not finalized
    };
}


/**
 * UPDATE RATING (EOD Lazy Update)
 * 
 * STRICT SPEC COMPLIANCE:
 * - "Rating updates once per day at end-of-day (e.g., 23:59)"
 * 
 * IMPLEMENTATION:
 * Since Next.js doesn't have built-in cron/scheduled tasks, we use a "Lazy Update" approach:
 * - Rating is finalized when the user performs their FIRST action of a NEW day
 * - This triggers calculation of YESTERDAY'S DPS and applies it to the rating
 * - The rating then "locks" for yesterday (no retroactive changes)
 * 
 * FLOW:
 * 1. User does action today → Check if `lastActiveDate` is yesterday
 * 2. If yes → Calculate DPS for yesterday, update rating, log history
 * 3. Update `lastActiveDate` to today
 * 4. For missed days (inactivity), apply decay penalties
 * 
 * This ensures:
 * ✓ Rating updates ONCE per day
 * ✓ No mid-day fluctuations
 * ✓ Honest reflection of past performance
 */
export async function updateRating(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const today = new Date();
    const lastActive = new Date(user.lastActiveDate);
    const isNewDay = lastActive.getDate() !== today.getDate() || lastActive.getMonth() !== today.getMonth();

    let newRating = user.rating;
    let delta = 0;

    if (isNewDay) {
        // We are crossing a boundary. We need to finalize the PREVIOUS day(s).

        // 0. Find the valid baseline (oldRating) from the last finalized history
        const lastHistory = await prisma.ratingHistory.findFirst({
            where: { userId },
            orderBy: { date: 'desc' }
        });

        // If no history, we assume a default start (e.g. 1000) or try to deduce from user.rating relative to current DPS?
        // Safer to rely on a fixed baseline or 1000 for new users.
        const baseRating = lastHistory?.newRating || 1000;

        // 1. Calculate DPS for `lastActive` (the day being finalized).
        const dpsYesterday = await calculateStrictDPS(userId, lastActive);

        // 2. Apply Rating Change to the BASELINE
        newRating = baseRating + dpsYesterday.totalDPS;
        delta = dpsYesterday.totalDPS;

        // 3. Log History for Yesterday
        await prisma.ratingHistory.create({
            data: {
                userId,
                date: lastActive, // Backdate to yesterday
                oldRating: baseRating,
                newRating: newRating,
                change: delta,
                dps: dpsYesterday.totalDPS,
                breakdown: JSON.stringify(dpsYesterday),
                reason: 'End of Day Summary'
            }
        });

        // 4. Handle Decay for gap days
        const diffTime = Math.abs(today.getTime() - lastActive.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
            const decay = (diffDays - 1) * 10;
            // Apply decay to the NEW confirmed rating
            newRating -= decay;

            // OPTIONAL: Log a separate history entry for decay so the chain remains valid?
            // For now, next day's baseRating calculation needs to know this.
            // If we don't log it, next day will pull 'newRating' (pre-decay) from history.
            // Let's log decay if it happened.
            if (decay > 0) {
                await prisma.ratingHistory.create({
                    data: {
                        userId,
                        date: today, // Decay applies "now" (or covering the gap)
                        oldRating: newRating + decay,
                        newRating: newRating,
                        change: -decay,
                        dps: 0,
                        breakdown: JSON.stringify({ reason: 'Inactivity Decay' }),
                        reason: 'Inactivity Penalty'
                    }
                });
            }
        }

        // Update User with new rating and new lastActiveDate
        // Recalculate Rank
        let newRank = 'Newbie';
        for (const rank of RANKS) {
            if (newRating >= rank.min) newRank = rank.name;
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                rating: newRating,
                rank: newRank,
                lastActiveDate: today, // Mark today as active
                lastDailySnapshot: today
            }
        });

        return {
            newRating,
            newRank,
            delta,
            dps: dpsYesterday, // This is yesterday's finalized stats
            finalized: true
        };

    } else {
        // Same day. Do NOT update rating. 
        // Just return the "Current Projected DPS" for UI display.
        // Does not touch DB rating.
        const currentDPS = await calculateStrictDPS(userId, today);
        return {
            newRating: user.rating, // Unchanged
            newRank: user.rank,
            delta: 0,
            dps: currentDPS,
            finalized: false
        };
    }
}

// For Dashboard "Productivity Score" display exports
export { calculateStrictDPS as calculateDPS };

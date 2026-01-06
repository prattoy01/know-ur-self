import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { RatingEngine } from '@/lib/rating-engine';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Ensure past days are finalized
        await RatingEngine.checkAndFinalizePastDays(session.userId);

        // Get current state from Rating Engine
        const state = await RatingEngine.getState(session.userId);

        // Get all finalized history (LOCKED entries)
        const history = await prisma.ratingHistory.findMany({
            where: { userId: session.userId },
            orderBy: { date: 'desc' }
        });

        // Format history entries
        const formattedHistory = history.map((h: any) => {
            let breakdown = {};
            try {
                breakdown = JSON.parse(h.breakdown);
            } catch (e) {
                breakdown = {};
            }

            return {
                id: h.id,
                date: h.date.toISOString(),
                oldRating: h.oldRating,
                newRating: h.newRating,
                change: h.change,
                dps: h.dps,
                breakdown,
                status: h.status,
                reason: h.reason,
                isLive: h.status === 'LIVE'
            };
        });

        return NextResponse.json({
            history: formattedHistory,
            currentRating: state.currentRating,
            tier: state.tier,
            todayDelta: state.todayDelta
        });
    } catch (error) {
        console.error('History API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}


/**
 * Rating History API (for graph)
 * 
 * GET /api/rating/history
 * Returns rating history for the graph display.
 * Uses RatingEngine for consistent data.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { RatingEngine } from '@/lib/rating-engine';

export async function GET() {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Ensure past days are finalized and get current state
        await RatingEngine.checkAndFinalizePastDays(session.userId);
        const state = await RatingEngine.getState(session.userId);

        // Get all history entries
        const history = await prisma.ratingHistory.findMany({
            where: { userId: session.userId },
            orderBy: { date: 'asc' }
        });

        // Format for graph display
        const formattedHistory = history.map((h: any) => ({
            id: h.id,
            date: h.date.toISOString(),
            rating: h.newRating,
            rank: h.status === 'LIVE' ? 'Live' : 'Finalized',
            change: h.change,
            isLive: h.status === 'LIVE'
        }));

        return NextResponse.json({
            history: formattedHistory,
            currentRating: state.currentRating,
            tier: state.tier
        });
    } catch (error) {
        console.error('Rating History Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * Rating State API
 * 
 * GET /api/rating/state
 * Returns the current rating state for the authenticated user.
 * This is the ONLY endpoint UI components should use to read rating data.
 */

import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { RatingEngine } from '@/lib/rating-engine';

export async function GET() {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Check and finalize past days if needed
        await RatingEngine.checkAndFinalizePastDays(session.userId);

        // Get current state
        const state = await RatingEngine.getState(session.userId);

        return NextResponse.json({ state });
    } catch (error) {
        console.error('Rating State Error:', error);
        return NextResponse.json({ error: 'Failed to get rating state' }, { status: 500 });
    }
}

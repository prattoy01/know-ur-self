/**
 * Rating Event API
 * 
 * POST /api/rating/event
 * Process a rating-affecting event and return updated state.
 * This is the ONLY endpoint that should modify rating data.
 */

import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { RatingEngine, RatingEvent, RatingEventType } from '@/lib/rating-engine';

const VALID_EVENT_TYPES: RatingEventType[] = [
    'TASK_CREATE',
    'TASK_COMPLETE',
    'TASK_UNCOMPLETE',
    'TASK_DELETE',
    'ACTIVITY_LOGGED',
    'EXPENSE_LOGGED',
    'STUDY_LOGGED',
    'DAY_FINALIZE',
    'REFRESH'
];

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { type, metadata } = body;

        // Validate event type
        if (!type || !VALID_EVENT_TYPES.includes(type)) {
            return NextResponse.json({
                error: `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}`
            }, { status: 400 });
        }

        // Check and finalize past days if needed
        await RatingEngine.checkAndFinalizePastDays(session.userId);

        // Process the event
        const event: RatingEvent = {
            type,
            userId: session.userId,
            metadata
        };

        const state = await RatingEngine.processEvent(event);

        return NextResponse.json({
            success: true,
            state
        });
    } catch (error) {
        console.error('Rating Event Error:', error);
        return NextResponse.json({ error: 'Failed to process rating event' }, { status: 500 });
    }
}

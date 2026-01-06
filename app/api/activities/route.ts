import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { RatingEngine } from '@/lib/rating-engine';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const activities = await prisma.activity.findMany({
            where: { userId: session.userId },
            orderBy: { date: 'desc' },
            take: 50
        });
        return NextResponse.json({ activities });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { type, name, duration, plannedDuration, notes, date } = await request.json();

        if (!type || !duration) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const activity = await prisma.activity.create({
            data: {
                userId: session.userId,
                type,
                name,
                duration: Number(duration),
                plannedDuration: plannedDuration ? Number(plannedDuration) : 0,
                notes,
                date: date ? new Date(date) : new Date(),
            },
        });

        // Trigger Rating Engine Update
        let ratingState = null;
        try {
            await RatingEngine.checkAndFinalizePastDays(session.userId);
            ratingState = await RatingEngine.processEvent({ type: 'ACTIVITY_LOGGED', userId: session.userId });
        } catch (e) {
            console.error('Rating update failed:', e);
        }

        return NextResponse.json({ success: true, activity, rating: ratingState });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
    }
}


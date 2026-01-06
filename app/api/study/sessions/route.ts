import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { RatingEngine } from '@/lib/rating-engine';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const sessions = await prisma.studySession.findMany({
            where: { userId: session.userId },
            include: { subject: true },
            orderBy: { date: 'desc' },
            take: 20
        });
        return NextResponse.json({ sessions });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { subjectId, duration, topics } = await request.json();

        const studySession = await prisma.studySession.create({
            data: {
                userId: session.userId,
                subjectId,
                duration: Number(duration),
                topics,
            },
        });

        // Trigger Rating Engine Update
        let ratingState = null;
        try {
            await RatingEngine.checkAndFinalizePastDays(session.userId);
            ratingState = await RatingEngine.processEvent({ type: 'STUDY_LOGGED', userId: session.userId });
        } catch (e) {
            console.error('Rating update failed:', e);
        }

        return NextResponse.json({ success: true, studySession, rating: ratingState });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to log study session' }, { status: 500 });
    }
}


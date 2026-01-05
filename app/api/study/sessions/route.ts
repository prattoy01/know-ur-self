import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { updateRating } from '@/lib/rating';

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

        // Trigger Rating Update
        await updateRating(session.userId);

        return NextResponse.json({ success: true, studySession });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to log study session' }, { status: 500 });
    }
}

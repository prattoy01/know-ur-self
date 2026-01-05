import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET() {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const history = await prisma.ratingHistory.findMany({
            where: { userId: session.userId },
            orderBy: { date: 'asc' }
        });

        return NextResponse.json({ history });
    } catch (error) {
        console.error('Rating History Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

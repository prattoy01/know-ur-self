import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const subjects = await prisma.subject.findMany({
            where: { userId: session.userId },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json({ subjects });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, difficulty } = await request.json();

        const subject = await prisma.subject.create({
            data: {
                userId: session.userId,
                name,
                difficulty: Number(difficulty),
            },
        });

        return NextResponse.json({ success: true, subject });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
    }
}

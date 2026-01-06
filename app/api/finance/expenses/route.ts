import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { RatingEngine } from '@/lib/rating-engine';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const expenses = await prisma.expense.findMany({
            where: { userId: session.userId },
            orderBy: { date: 'desc' },
            take: 50
        });
        return NextResponse.json({ expenses });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { amount, category, description } = await request.json();

        if (!amount || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const expense = await prisma.expense.create({
            data: {
                userId: session.userId,
                amount: Number(amount),
                category,
                description,
            },
        });

        // Trigger Rating Engine Update (expenses affect budget score)
        let ratingState = null;
        try {
            await RatingEngine.checkAndFinalizePastDays(session.userId);
            ratingState = await RatingEngine.processEvent({ type: 'EXPENSE_LOGGED', userId: session.userId });
        } catch (e) {
            console.error('Rating update failed:', e);
        }

        return NextResponse.json({ success: true, expense, rating: ratingState });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to log expense' }, { status: 500 });
    }
}


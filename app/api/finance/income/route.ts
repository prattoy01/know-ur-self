import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const incomes = await prisma.income.findMany({
            where: { userId: session.userId },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json({ incomes });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch incomes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { amount, source, description } = await request.json();

        const income = await prisma.income.create({
            data: {
                userId: session.userId,
                amount: Number(amount),
                source: source || 'OTHER',
                description: description || null
            }
        });

        return NextResponse.json({ success: true, income });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to add income' }, { status: 500 });
    }
}

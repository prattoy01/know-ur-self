import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const budget = await prisma.budget.findFirst({
            where: { userId: session.userId },
        });
        return NextResponse.json({ budget });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { amount, type } = await request.json();

        // Upsert budget (assuming single global budget for now per user, or modify model logic)
        // For simplicity, we'll maintain one main budget entry per user or create new if not exists
        // Ideally we might want history, but the requirements imply "Set Budget".

        // Let's check if one exists
        const existing = await prisma.budget.findFirst({
            where: { userId: session.userId }
        });

        let budget;
        if (existing) {
            budget = await prisma.budget.update({
                where: { id: existing.id },
                data: { amount: Number(amount), type }
            });
        } else {
            budget = await prisma.budget.create({
                data: {
                    userId: session.userId,
                    amount: Number(amount),
                    type,
                }
            });
        }

        return NextResponse.json({ success: true, budget });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to set budget' }, { status: 500 });
    }
}

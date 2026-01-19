import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { RatingEngine } from '@/lib/rating-engine';

export async function GET() {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const records = await prisma.borrowLend.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ records });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { type, personName, amount, description, dueDate } = await request.json();

        if (!type || !personName || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['BORROW', 'LEND'].includes(type)) {
            return NextResponse.json({ error: 'Invalid type. Must be BORROW or LEND' }, { status: 400 });
        }

        const record = await prisma.borrowLend.create({
            data: {
                userId: session.userId,
                type,
                personName,
                amount: Number(amount),
                description: description || null,
                dueDate: dueDate ? new Date(dueDate) : null
            }
        });

        // If LEND: Create an expense (money going out of your pocket)
        if (type === 'LEND') {
            await prisma.expense.create({
                data: {
                    userId: session.userId,
                    amount: Number(amount),
                    category: 'LEND',
                    description: `Lent to ${personName}${description ? ` - ${description}` : ''}`,
                }
            });

            // Trigger Rating Engine Update
            try {
                await RatingEngine.checkAndFinalizePastDays(session.userId);
                await RatingEngine.processEvent({ type: 'EXPENSE_LOGGED', userId: session.userId });
            } catch (e) {
                console.error('Rating update failed:', e);
            }
        }

        // If BORROW: Create an income entry (money coming into your pocket)
        if (type === 'BORROW') {
            await prisma.income.create({
                data: {
                    userId: session.userId,
                    amount: Number(amount),
                    source: 'OTHER',
                    description: `Borrowed from ${personName}${description ? ` - ${description}` : ''}`,
                }
            });
        }

        return NextResponse.json({ success: true, record });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create record' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing record ID' }, { status: 400 });
        }

        // Verify the record belongs to the user
        const existing = await prisma.borrowLend.findFirst({
            where: { id, userId: session.userId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        const record = await prisma.borrowLend.update({
            where: { id },
            data: {
                isSettled: true,
                settledAt: new Date()
            }
        });

        // If settling a BORROW: Create an expense (you're paying back borrowed money)
        if (existing.type === 'BORROW') {
            await prisma.expense.create({
                data: {
                    userId: session.userId,
                    amount: existing.amount,
                    category: 'BORROW_REPAYMENT',
                    description: `Repaid to ${existing.personName}${existing.description ? ` - ${existing.description}` : ''}`,
                }
            });

            // Trigger Rating Engine Update
            try {
                await RatingEngine.checkAndFinalizePastDays(session.userId);
                await RatingEngine.processEvent({ type: 'EXPENSE_LOGGED', userId: session.userId });
            } catch (e) {
                console.error('Rating update failed:', e);
            }
        }

        return NextResponse.json({ success: true, record });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to settle record' }, { status: 500 });
    }
}

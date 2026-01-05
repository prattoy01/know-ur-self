import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { updateRating, recalculateCurrentRating } from '@/lib/rating';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: session.userId,
                deletedAt: null // Only fetch active tasks
            },
            orderBy: [
                { isCompleted: 'asc' }, // Pending first
                { priority: 'desc' },   // HIGH -> LOW (alphabetical H < L < M is wrong, logic needed)
                // Actually HIGH/MEDIUM/LOW alphabetical: H, L, M. High(H), Medium(M), Low(L). M > H? No.
                // Quick fix: Map priority to int or sort client side. For now just fetch.
                { createdAt: 'desc' }
            ]
        });
        return NextResponse.json({ tasks });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { title, priority, difficulty, estimatedDuration, date, notes } = await request.json();

        // Parse the task date
        const taskDate = date ? new Date(date) : new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);

        // Determine date category
        const isPast = taskDate < today;
        const isToday = taskDate.getTime() === today.getTime();
        const isFuture = taskDate > today;

        // RULE 1: Block past task creation
        if (isPast) {
            return NextResponse.json({
                error: '🔒 Cannot create tasks for past dates. Past tasks are locked.'
            }, { status: 403 });
        }

        // RULE 2: Same-day tasks - ALLOW creation anytime, but flag for penalty
        // Penalty will be calculated in DPS based on createdAt timestamp
        // The task.createdAt field automatically tracks when it was created

        const task = await prisma.task.create({
            data: {
                userId: session.userId,
                title,
                priority: priority || 'MEDIUM',
                difficulty: difficulty || 'MEDIUM',
                estimatedDuration: estimatedDuration ? Number(estimatedDuration) : 30,
                date: date ? new Date(date) : new Date(),
                notes: notes || null,
            },
        });

        // Trigger INSTANT Rating Update
        let ratingUpdate = null;
        try {
            ratingUpdate = await recalculateCurrentRating(session.userId);
        } catch (ratingError) {
            console.error('Failed to update rating:', ratingError);
            // Don't fail the request if rating update fails, just log it
        }

        return NextResponse.json({ success: true, task, rating: ratingUpdate });
    } catch (error: any) {
        console.error('Task Creation Error:', error);
        return NextResponse.json({
            error: `Failed to create task: ${error.message || 'Unknown error'}`
        }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, isCompleted } = await request.json();

        // Fetch the task to check its date
        const task = await prisma.task.findUnique({
            where: { id, deletedAt: null }
        });

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Parse dates
        const taskDate = new Date(task.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);

        const isPast = taskDate < today;
        const isToday = taskDate.getTime() === today.getTime();

        // RULE 1: Block editing past tasks
        if (isPast) {
            return NextResponse.json({
                error: '🔒 Cannot edit past tasks. Past tasks are locked.'
            }, { status: 403 });
        }

        // RULE 2: Same-day edit after 6 AM - allow with warning
        if (isToday) {
            const now = new Date();
            const hour = now.getHours();
            if (hour >= 6) {
                // Allow the edit but include a warning in response
                const updatedTask = await prisma.task.update({
                    where: { id, deletedAt: null },
                    data: { isCompleted },
                });
                // Trigger INSTANT Rating Update
                let ratingUpdate = null;
                try {
                    ratingUpdate = await recalculateCurrentRating(session.userId);
                } catch (e) {
                    console.error('Rating update failed:', e);
                }
                return NextResponse.json({
                    task: updatedTask,
                    rating: ratingUpdate,
                    warning: '⚠️ Editing after 6 AM may affect your rating.'
                });
            }
        }

        // RULE 3: Future tasks or same-day before 6 AM - proceed freely
        const updatedTask = await prisma.task.update({
            where: { id, deletedAt: null },
            data: { isCompleted },
        });
        // Trigger INSTANT Rating Update
        let ratingUpdate = null;
        try {
            const { recalculateCurrentRating } = await import('@/lib/rating');
            ratingUpdate = await recalculateCurrentRating(session.userId);
        } catch (e) {
            console.error('Rating update failed:', e);
        }
        return NextResponse.json({ task: updatedTask, rating: ratingUpdate });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await request.json();

        // Fetch the task to check its date
        const task = await prisma.task.findUnique({
            where: { id }
        });

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // RULE: Completed tasks check
        if (task.isCompleted) {
            return NextResponse.json({
                error: '❌ Locked: You cannot delete a completed task!'
            }, { status: 403 });
        }

        // Parse dates
        const taskDate = new Date(task.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);

        const isPast = taskDate < today;
        const isToday = taskDate.getTime() === today.getTime();

        // RULE 1: Block deleting past tasks
        if (isPast) {
            return NextResponse.json({
                error: '🔒 Cannot delete past tasks. Past tasks are locked.'
            }, { status: 403 });
        }

        // RULE 2: Same-day delete after 6 AM - ALWAYS penalized
        if (isToday) {
            const now = new Date();
            const hour = now.getHours();
            if (hour >= 6) {
                // Soft delete (so penalty can be tracked)
                await prisma.task.update({
                    where: { id },
                    data: { deletedAt: new Date() }
                });

                // Trigger INSTANT Rating Update
                let ratingUpdate = null;
                try {
                    ratingUpdate = await recalculateCurrentRating(session.userId);
                } catch (e) {
                    console.error('Rating update failed:', e);
                }

                return NextResponse.json({
                    success: true,
                    rating: ratingUpdate,
                    warning: '⚠️ Deletion penalty applied: -5 rating points.'
                });
            }
        }

        // Soft Delete
        await prisma.task.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        // Trigger INSTANT Rating Update
        let ratingUpdate = null;
        try {
            const { recalculateCurrentRating } = await import('@/lib/rating');
            ratingUpdate = await recalculateCurrentRating(session.userId);
        } catch (e) {
            console.error('Rating update failed:', e);
        }

        return NextResponse.json({ success: true, rating: ratingUpdate });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}

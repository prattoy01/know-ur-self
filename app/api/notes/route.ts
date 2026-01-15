import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const archived = searchParams.get('archived') === 'true';
        const labelId = searchParams.get('label');

        const notes = await prisma.note.findMany({
            where: {
                userId: session.userId,
                isArchived: archived,
                ...(labelId && {
                    labels: {
                        some: { id: labelId }
                    }
                })
            },
            include: {
                labels: true
            },
            orderBy: [
                { isPinned: 'desc' },
                { updatedAt: 'desc' }
            ]
        });

        return NextResponse.json({ notes });
    } catch (error) {
        console.error('Notes fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { title, content, color, labelIds } = await request.json();

        if (!content && !title) {
            return NextResponse.json({ error: 'Note must have title or content' }, { status: 400 });
        }

        const note = await prisma.note.create({
            data: {
                userId: session.userId,
                title: title || null,
                content: content || '',
                color: color || '#ffffff',
                ...(labelIds?.length > 0 && {
                    labels: {
                        connect: labelIds.map((id: string) => ({ id }))
                    }
                })
            },
            include: {
                labels: true
            }
        });

        return NextResponse.json({ note });
    } catch (error) {
        console.error('Note creation error:', error);
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, title, content, color, isPinned, isArchived, labelIds } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
        }

        // Verify ownership
        const existing = await prisma.note.findFirst({
            where: { id, userId: session.userId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        const note = await prisma.note.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(content !== undefined && { content }),
                ...(color !== undefined && { color }),
                ...(isPinned !== undefined && { isPinned }),
                ...(isArchived !== undefined && { isArchived }),
                ...(labelIds !== undefined && {
                    labels: {
                        set: labelIds.map((id: string) => ({ id }))
                    }
                })
            },
            include: {
                labels: true
            }
        });

        return NextResponse.json({ note });
    } catch (error) {
        console.error('Note update error:', error);
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
        }

        // Verify ownership
        const existing = await prisma.note.findFirst({
            where: { id, userId: session.userId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        await prisma.note.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Note deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
}

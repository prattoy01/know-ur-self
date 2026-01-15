import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET() {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const labels = await prisma.noteLabel.findMany({
            where: { userId: session.userId },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ labels });
    } catch (error) {
        console.error('Labels fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, color } = await request.json();

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Label name required' }, { status: 400 });
        }

        const label = await prisma.noteLabel.create({
            data: {
                userId: session.userId,
                name: name.trim(),
                color: color || '#6b7280'
            }
        });

        return NextResponse.json({ label });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'Label already exists' }, { status: 409 });
        }
        console.error('Label creation error:', error);
        return NextResponse.json({ error: 'Failed to create label' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Label ID required' }, { status: 400 });
        }

        // Verify ownership
        const existing = await prisma.noteLabel.findFirst({
            where: { id, userId: session.userId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Label not found' }, { status: 404 });
        }

        await prisma.noteLabel.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Label deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete label' }, { status: 500 });
    }
}

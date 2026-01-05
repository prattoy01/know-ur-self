import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, logAdminAction, getClientIP, unauthorizedResponse } from '@/lib/adminAuth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    const { id } = await params;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { email: true, status: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.status === 'suspended') {
            return NextResponse.json({ error: 'User is already suspended' }, { status: 400 });
        }

        if (user.status === 'deleted') {
            return NextResponse.json({ error: 'Cannot suspend deleted user' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id },
            data: { status: 'suspended' }
        });

        await logAdminAction(
            admin.id,
            'SUSPEND_USER',
            id,
            { email: user.email },
            getClientIP(request)
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Suspend user error:', error);
        return NextResponse.json({ error: 'Failed to suspend user' }, { status: 500 });
    }
}

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
        const resetRequest = await prisma.passwordResetRequest.findUnique({
            where: { id },
            include: { user: { select: { email: true } } }
        });

        if (!resetRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (resetRequest.status !== 'pending') {
            return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
        }

        await prisma.passwordResetRequest.update({
            where: { id },
            data: { status: 'invalidated' }
        });

        await logAdminAction(
            admin.id,
            'INVALIDATE_PASSWORD_RESET',
            resetRequest.userId,
            { email: resetRequest.user.email },
            getClientIP(request)
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Invalidate password reset error:', error);
        return NextResponse.json({ error: 'Failed to invalidate' }, { status: 500 });
    }
}

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

        // Invalidate old request and create new one
        await prisma.passwordResetRequest.update({
            where: { id },
            data: { status: 'invalidated' }
        });

        // Create new reset token
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.passwordResetRequest.create({
            data: {
                userId: resetRequest.userId,
                token,
                expiresAt
            }
        });

        // TODO: Actually send the email with the new token
        // For now, just log that we would send it

        await logAdminAction(
            admin.id,
            'RESEND_PASSWORD_RESET',
            resetRequest.userId,
            { email: resetRequest.user.email },
            getClientIP(request)
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Resend password reset error:', error);
        return NextResponse.json({ error: 'Failed to resend' }, { status: 500 });
    }
}

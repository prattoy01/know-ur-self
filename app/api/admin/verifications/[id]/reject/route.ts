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
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || null;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { email: true, emailVerified: true, status: true, username: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Soft delete the user as rejection and rename email to free up constraints
        const timestamp = Date.now();
        const deletedEmail = `rejected_${timestamp}_${user.email}`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            status: 'deleted',
            deletedAt: new Date(),
            email: deletedEmail
        };

        if (user.username) {
            updateData.username = `rejected_${timestamp}_${user.username}`;
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        });

        await logAdminAction(
            admin.id,
            'REJECT_VERIFICATION',
            id,
            { email: user.email, reason },
            getClientIP(request)
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reject verification error:', error);
        return NextResponse.json({ error: 'Failed to reject' }, { status: 500 });
    }
}

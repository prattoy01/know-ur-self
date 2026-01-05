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
            select: { email: true, emailVerified: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ error: 'Already verified' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id },
            data: { emailVerified: new Date() }
        });

        await logAdminAction(
            admin.id,
            'APPROVE_VERIFICATION',
            id,
            { email: user.email },
            getClientIP(request)
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Approve verification error:', error);
        return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
    }
}

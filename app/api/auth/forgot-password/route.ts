import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'If an account with that email exists, a reset request has been submitted.'
            });
        }

        // Invalidate any existing pending requests for this user
        await prisma.passwordResetRequest.updateMany({
            where: {
                userId: user.id,
                status: 'pending'
            },
            data: {
                status: 'invalidated'
            }
        });

        // Create a new password reset request
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.passwordResetRequest.create({
            data: {
                userId: user.id,
                token,
                status: 'pending',
                expiresAt
            }
        });

        // Note: In a real implementation, you would send an email here
        // with a link containing the token. For now, the admin can
        // see pending requests in the admin panel and manually reset.

        console.log(`Password reset request created for ${email}`);

        return NextResponse.json({
            success: true,
            message: 'If an account with that email exists, a reset request has been submitted.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Secret key for admin setup - should match environment variable
const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'setup-admin-2024';

export async function POST(request: NextRequest) {
    try {
        const { email, setupKey } = await request.json();

        // Verify setup key
        if (setupKey !== ADMIN_SETUP_KEY) {
            return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Make user admin and verify their email
        await prisma.user.update({
            where: { email },
            data: {
                isAdmin: true,
                role: 'admin',
                emailVerified: user.emailVerified || new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: `${email} is now an admin!`
        });
    } catch (error) {
        console.error('Admin setup error:', error);
        return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
    }
}

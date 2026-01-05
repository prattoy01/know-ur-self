import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession, hashPassword, verifyPassword } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { portfolio: true }
    });

    return NextResponse.json({ user });
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { bio, skills, customUrl, isPublic, showStats, showRating, name, currentPassword, newPassword } = await request.json();

        const updateData: any = { bio, skills };
        if (name) updateData.name = name;

        // Password change logic
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password is required to set a new one' }, { status: 400 });
            }

            const user = await prisma.user.findUnique({ where: { id: session.userId } });
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            const isCorrect = await verifyPassword(currentPassword, user.passwordHash);
            if (!isCorrect) {
                return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
            }

            updateData.passwordHash = await hashPassword(newPassword);
        }

        // Update User Profile
        await prisma.user.update({
            where: { id: session.userId },
            data: updateData
        });

        // Upsert Portfolio Settings
        await prisma.portfolioSettings.upsert({
            where: { userId: session.userId },
            update: { customUrl, isPublic, showStats, showRating },
            create: { userId: session.userId, customUrl, isPublic, showStats, showRating }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

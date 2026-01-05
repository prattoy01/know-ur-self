import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, logAdminAction, getClientIP, unauthorizedResponse } from '@/lib/adminAuth';

// GET - Full user details with activity summary
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    const { id } = await params;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                bio: true,
                emailVerified: true,
                role: true,
                status: true,
                isAdmin: true,
                rating: true,
                rank: true,
                currentStreak: true,
                portfolioComplete: true,
                lastActiveDate: true,
                createdAt: true,
                deletedAt: true,
                _count: {
                    select: {
                        activities: true,
                        expenses: true,
                        tasks: true,
                        studySessions: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('User details error:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

// DELETE - Soft delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    const { id } = await params;

    // Prevent self-deletion
    if (id === admin.id) {
        return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { email: true, status: true, role: true, username: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Cannot delete another admin
        if (user.role === 'admin') {
            return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 });
        }

        // Soft delete - rename email/username to free up unique constraints
        const timestamp = Date.now();
        const deletedEmail = `deleted_${timestamp}_${user.email}`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            status: 'deleted',
            deletedAt: new Date(),
            email: deletedEmail
        };

        if (user.username) {
            updateData.username = `deleted_${timestamp}_${user.username}`;
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        });

        // Log action
        await logAdminAction(
            admin.id,
            'DELETE_USER',
            id,
            { email: user.email },
            getClientIP(request)
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

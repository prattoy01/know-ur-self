import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

async function verifyAdmin(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, isAdmin: true }
        });
        if (!user?.isAdmin) return null;
        return user;
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, verifiedUsers, unverifiedUsers, newThisWeek] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { emailVerified: { not: null } } }),
        prisma.user.count({ where: { emailVerified: null } }),
        prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } })
    ]);

    return NextResponse.json({
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        newThisWeek
    });
}

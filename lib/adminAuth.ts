import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export interface AdminUser {
    id: string;
    email: string;
    role: string;
    isAdmin: boolean;
}

export async function verifyAdmin(request: NextRequest): Promise<AdminUser | null> {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, isAdmin: true, status: true }
        });

        // Must be admin and not suspended/deleted
        if (!user || (!user.isAdmin && user.role !== 'admin')) return null;
        if (user.status !== 'active') return null;

        return user;
    } catch {
        return null;
    }
}

export async function logAdminAction(
    adminId: string,
    actionType: string,
    targetUserId: string | null,
    details: Record<string, unknown> | null = null,
    ipAddress: string | null = null
) {
    try {
        await prisma.adminLog.create({
            data: {
                adminId,
                actionType,
                targetUserId,
                details: details ? JSON.stringify(details) : null,
                ipAddress
            }
        });
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
}

export function getClientIP(request: NextRequest): string | null {
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        null;
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

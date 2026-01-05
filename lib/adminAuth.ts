import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this-in-env';
const key = new TextEncoder().encode(JWT_SECRET);

export interface AdminUser {
    id: string;
    email: string;
    role: string;
    isAdmin: boolean;
}

export async function verifyAdmin(request: NextRequest): Promise<AdminUser | null> {
    const session = request.cookies.get('session')?.value;
    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] });
        const userId = payload.userId as string;

        const user = await prisma.user.findUnique({
            where: { id: userId },
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

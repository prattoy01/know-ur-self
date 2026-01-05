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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await verifyAdmin(request);
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const user = await prisma.user.update({
            where: { id },
            data: { emailVerified: new Date() },
            select: { id: true, email: true, emailVerified: true }
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
}

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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all'; // all, verified, unverified
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const where: Record<string, unknown> = {};

    if (search) {
        where.OR = [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (filter === 'verified') {
        where.emailVerified = { not: null };
    } else if (filter === 'unverified') {
        where.emailVerified = null;
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                emailVerified: true,
                isAdmin: true,
                createdAt: true,
                portfolioComplete: true,
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where })
    ]);

    return NextResponse.json({
        users,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
    });
}

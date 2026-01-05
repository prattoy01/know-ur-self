import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const minRating = parseInt(searchParams.get('minRating') || '0');
    const maxRating = parseInt(searchParams.get('maxRating') || '4000');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Search by name, email, username
    if (search) {
        where.OR = [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } }
        ];
    }

    // Filter by verification status
    if (filter === 'verified') {
        where.emailVerified = { not: null };
    } else if (filter === 'unverified') {
        where.emailVerified = null;
    }

    // Filter by role
    if (role !== 'all') {
        where.role = role;
    }

    // Filter by status (exclude deleted unless specifically requested)
    if (status === 'all') {
        where.status = { not: 'deleted' };
    } else {
        where.status = status;
    }

    // Filter by rating range
    if (minRating > 0 || maxRating < 4000) {
        where.rating = {
            gte: minRating,
            lte: maxRating
        };
    }

    try {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    username: true,
                    emailVerified: true,
                    role: true,
                    status: true,
                    isAdmin: true,
                    rating: true,
                    rank: true,
                    portfolioComplete: true,
                    lastActiveDate: true,
                    createdAt: true,
                    deletedAt: true,
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
    } catch (error) {
        console.error('Users list error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

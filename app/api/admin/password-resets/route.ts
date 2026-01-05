import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status !== 'all') {
        where.status = status;
    }

    try {
        const [requests, total] = await Promise.all([
            prisma.passwordResetRequest.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.passwordResetRequest.count({ where })
        ]);

        // Map to hide tokens
        const safeRequests = requests.map(r => ({
            id: r.id,
            userId: r.userId,
            user: r.user,
            status: r.status,
            expiresAt: r.expiresAt,
            createdAt: r.createdAt,
            isExpired: new Date() > r.expiresAt
        }));

        return NextResponse.json({
            requests: safeRequests,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Password resets list error:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

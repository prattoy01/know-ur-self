import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    try {
        const [requests, total] = await Promise.all([
            prisma.user.findMany({
                where: {
                    emailVerified: null,
                    status: { not: 'deleted' }
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({
                where: {
                    emailVerified: null,
                    status: { not: 'deleted' }
                }
            })
        ]);

        return NextResponse.json({
            requests,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Verifications list error:', error);
        return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 });
    }
}

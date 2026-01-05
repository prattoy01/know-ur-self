import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const actionType = searchParams.get('actionType') || '';
    const adminId = searchParams.get('adminId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 50;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (actionType) {
        where.actionType = actionType;
    }

    if (adminId) {
        where.adminId = adminId;
    }

    try {
        const [logs, total] = await Promise.all([
            prisma.adminLog.findMany({
                where,
                include: {
                    admin: {
                        select: { id: true, email: true, name: true }
                    },
                    targetUser: {
                        select: { id: true, email: true, name: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.adminLog.count({ where })
        ]);

        return NextResponse.json({
            logs,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Logs error:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

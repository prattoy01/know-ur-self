import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'users';

    try {
        let csv = '';

        if (type === 'users') {
            const users = await prisma.user.findMany({
                where: { status: { not: 'deleted' } },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    rating: true,
                    emailVerified: true,
                    createdAt: true,
                    lastActiveDate: true,
                },
                orderBy: { createdAt: 'desc' }
            });

            csv = 'ID,Email,Name,Role,Status,Rating,Verified,Created,Last Active\n';
            csv += users.map(u =>
                `${u.id},${u.email},${u.name || ''},${u.role},${u.status},${u.rating},${u.emailVerified ? 'Yes' : 'No'},${u.createdAt.toISOString()},${u.lastActiveDate.toISOString()}`
            ).join('\n');
        } else if (type === 'activity') {
            const activities = await prisma.activity.findMany({
                include: {
                    user: { select: { email: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: 1000
            });

            csv = 'ID,User Email,Type,Name,Duration (min),Date\n';
            csv += activities.map(a =>
                `${a.id},${a.user.email},${a.type},${a.name || ''},${a.duration},${a.createdAt.toISOString()}`
            ).join('\n');
        }

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
        // User growth data - daily signups
        const userGrowth = await prisma.$queryRaw`
            SELECT 
                DATE("createdAt") as date,
                COUNT(*) as count
            FROM "User"
            WHERE "createdAt" >= ${startDate}
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        ` as { date: Date; count: bigint }[];

        // Rating distribution
        const ratingDistribution = await prisma.$queryRaw`
            SELECT 
                CASE 
                    WHEN rating < 800 THEN 'Newbie (<800)'
                    WHEN rating < 1000 THEN 'Beginner (800-999)'
                    WHEN rating < 1200 THEN 'Pupil (1000-1199)'
                    WHEN rating < 1400 THEN 'Specialist (1200-1399)'
                    WHEN rating < 1600 THEN 'Expert (1400-1599)'
                    WHEN rating < 1900 THEN 'Candidate Master (1600-1899)'
                    ELSE 'Master (1900+)'
                END as bracket,
                COUNT(*) as count
            FROM "User"
            WHERE status = 'active'
            GROUP BY bracket
            ORDER BY MIN(rating) ASC
        ` as { bracket: string; count: bigint }[];

        // Daily active users
        const dailyActiveUsers = await prisma.$queryRaw`
            SELECT 
                DATE("lastActiveDate") as date,
                COUNT(*) as count
            FROM "User"
            WHERE "lastActiveDate" >= ${startDate}
            AND status = 'active'
            GROUP BY DATE("lastActiveDate")
            ORDER BY date ASC
        ` as { date: Date; count: bigint }[];

        // Portfolio completion rate
        const portfolioStats = await prisma.user.aggregate({
            where: { status: 'active' },
            _count: { _all: true },
        });

        const portfolioComplete = await prisma.user.count({
            where: { status: 'active', portfolioComplete: true }
        });

        // Task completion stats
        const taskStats = await prisma.task.aggregate({
            _count: { _all: true },
        });

        const completedTasks = await prisma.task.count({
            where: { isCompleted: true }
        });

        return NextResponse.json({
            userGrowth: userGrowth.map(u => ({
                date: u.date,
                count: Number(u.count)
            })),
            ratingDistribution: ratingDistribution.map(r => ({
                bracket: r.bracket,
                count: Number(r.count)
            })),
            dailyActiveUsers: dailyActiveUsers.map(d => ({
                date: d.date,
                count: Number(d.count)
            })),
            portfolioStats: {
                total: portfolioStats._count._all,
                complete: portfolioComplete,
                rate: portfolioStats._count._all > 0
                    ? Math.round((portfolioComplete / portfolioStats._count._all) * 100)
                    : 0
            },
            taskStats: {
                total: taskStats._count._all,
                completed: completedTasks,
                rate: taskStats._count._all > 0
                    ? Math.round((completedTasks / taskStats._count._all) * 100)
                    : 0
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}

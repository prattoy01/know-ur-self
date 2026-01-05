import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
        const [
            totalUsers,
            activeUsers,
            newToday,
            newThisWeek,
            pendingVerifications,
            pendingPasswordResets,
            totalPortfolios,
            avgRating,
            suspendedUsers
        ] = await Promise.all([
            // Total users (excluding deleted)
            prisma.user.count({ where: { status: { not: 'deleted' } } }),

            // Active users (last 7 days)
            prisma.user.count({
                where: {
                    lastActiveDate: { gte: oneWeekAgo },
                    status: 'active'
                }
            }),

            // New signups today
            prisma.user.count({
                where: { createdAt: { gte: today } }
            }),

            // New signups this week
            prisma.user.count({
                where: { createdAt: { gte: oneWeekAgo } }
            }),

            // Pending verifications
            prisma.user.count({
                where: {
                    emailVerified: null,
                    status: { not: 'deleted' }
                }
            }),

            // Pending password resets
            prisma.passwordResetRequest.count({
                where: { status: 'pending' }
            }),

            // Total portfolios
            prisma.user.count({
                where: { portfolioComplete: true }
            }),

            // Average rating
            prisma.user.aggregate({
                _avg: { rating: true },
                where: { status: 'active' }
            }),

            // Suspended users
            prisma.user.count({
                where: { status: 'suspended' }
            })
        ]);

        // Calculate trends (compare to previous period)
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const previousWeekSignups = await prisma.user.count({
            where: {
                createdAt: {
                    gte: twoWeeksAgo,
                    lt: oneWeekAgo
                }
            }
        });

        const signupTrend = previousWeekSignups > 0
            ? Math.round(((newThisWeek - previousWeekSignups) / previousWeekSignups) * 100)
            : 100;

        return NextResponse.json({
            totalUsers,
            activeUsers,
            newToday,
            newThisWeek,
            pendingVerifications,
            pendingPasswordResets,
            totalPortfolios,
            averageRating: Math.round(avgRating._avg.rating || 1000),
            suspendedUsers,
            trends: {
                signups: signupTrend
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

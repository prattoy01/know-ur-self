import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { updateRating, calculateStrictDPS } from '@/lib/rating';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Trigger lazy update to ensure "Yesterday" is finalized if needed
        await updateRating(session.userId);

        // Get finalized history (past days only)
        const history = await prisma.ratingHistory.findMany({
            where: { userId: session.userId },
            orderBy: { date: 'desc' }
        });

        // Get current user rating and info
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { rating: true }
        });

        // Calculate TODAY's provisional rating
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();

        const dps = await calculateStrictDPS(session.userId, today);

        // Find base rating (last finalized or default)
        const lastHistory = history[0];
        const baseRating = lastHistory?.newRating || 1000;
        const currentRating = user?.rating || 1000;
        const todayChange = currentRating - baseRating;

        // Create TODAY's LIVE entry
        const liveEntry = {
            id: 'LIVE',
            userId: session.userId,
            date: todayStr,
            oldRating: baseRating,
            newRating: currentRating,
            change: todayChange,
            dps: dps.totalDPS,
            breakdown: dps,
            reason: 'Live (Ongoing)',
            createdAt: today,
            isLive: true // Flag to identify live entry
        };

        // Parse JSON strings back to objects for finalized history
        const parsedHistory = history.map((h: any) => {
            try {
                return {
                    ...h,
                    breakdown: JSON.parse(h.breakdown),
                    isLive: false
                };
            } catch (e) {
                return { ...h, breakdown: {}, isLive: false };
            }
        });

        // Return LIVE entry first, then finalized history
        return NextResponse.json({
            history: [liveEntry, ...parsedHistory],
            liveRating: currentRating
        });
    } catch (error) {
        console.error('History API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}

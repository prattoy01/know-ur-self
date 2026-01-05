import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET() {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { portfolio: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            settings: user.portfolio || {},
            user: {
                bio: user.bio,
                skills: user.skills
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { customUrl, isPublic, showStats, showRating, bio, skills } = await request.json();

        // Transaction to update both User and PortfolioSettings
        await prisma.$transaction(async (tx) => {
            // Update User details
            await tx.user.update({
                where: { id: session.userId },
                data: { bio, skills }
            });

            // Upsert Portfolio Settings
            await tx.portfolioSettings.upsert({
                where: { userId: session.userId },
                create: {
                    userId: session.userId,
                    customUrl: customUrl || null,
                    isPublic,
                    showStats,
                    showRating
                },
                update: {
                    customUrl: customUrl || null,
                    isPublic,
                    showStats,
                    showRating
                }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Portfolio Save Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'This custom URL is already taken.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

// POST: Complete onboarding and mark portfolio as active
export async function POST() {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch user with all required data
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                portfolioSkills: true,
                education: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Validate required fields
        const errors: string[] = [];

        if (!user.name?.trim()) errors.push('Full name is required');
        if (!user.username?.trim()) errors.push('Username is required');
        if (!user.headline?.trim()) errors.push('Headline is required');
        if (!user.bio?.trim()) errors.push('Bio is required');
        if (!user.careerGoal?.trim()) errors.push('Career goal is required');
        if (user.portfolioSkills.length === 0) errors.push('At least one skill is required');
        if (user.education.length === 0) errors.push('At least one education entry is required');

        if (errors.length > 0) {
            return NextResponse.json({
                error: 'Please complete all required fields',
                details: errors,
            }, { status: 400 });
        }

        // Mark portfolio as complete
        await prisma.user.update({
            where: { id: session.userId },
            data: { portfolioComplete: true },
        });

        // Ensure portfolio settings exist
        await prisma.portfolioSettings.upsert({
            where: { userId: session.userId },
            create: {
                userId: session.userId,
                isPublic: true,
            },
            update: {},
        });

        // Create response with updated cookie
        const response = NextResponse.json({
            success: true,
            message: 'Portfolio setup complete!',
            username: user.username,
        });

        // Update portfolio_complete cookie
        response.cookies.set('portfolio_complete', 'true', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error) {
        console.error('Onboarding Complete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

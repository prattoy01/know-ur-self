import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Strict: Enforce Email Verification
        if (!user.emailVerified) {
            return NextResponse.json({ error: 'Please verify your email before logging in.' }, { status: 403 });
        }

        await createSession(user.id);

        // Create response with portfolio completion cookie
        const response = NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email },
            portfolioComplete: user.portfolioComplete,
        });

        // Set portfolio_complete cookie for middleware
        response.cookies.set('portfolio_complete', user.portfolioComplete.toString(), {
            httpOnly: false, // Allow client-side read
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

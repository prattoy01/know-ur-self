import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-change-this-in-env';
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Routes that require authentication
    const protectedRoutes = ['/dashboard', '/settings', '/onboarding'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Check for session
    const session = request.cookies.get('session')?.value;

    if (isProtectedRoute) {
        // No session = redirect to login
        if (!session) {
            const loginUrl = new URL('/login', request.nextUrl.origin);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Verify JWT
        try {
            await jwtVerify(session, key, { algorithms: ['HS256'] });
        } catch {
            const loginUrl = new URL('/login', request.nextUrl.origin);
            return NextResponse.redirect(loginUrl);
        }

        // For dashboard routes, check portfolio completion via cookie
        // The cookie is set after login/registration by the client
        if (pathname.startsWith('/dashboard')) {
            const portfolioComplete = request.cookies.get('portfolio_complete')?.value;

            // If explicitly incomplete, redirect to onboarding
            if (portfolioComplete === 'false') {
                return NextResponse.redirect(new URL('/onboarding', request.nextUrl.origin));
            }
        }

        // If on onboarding and portfolio is complete, redirect to dashboard
        if (pathname.startsWith('/onboarding')) {
            const portfolioComplete = request.cookies.get('portfolio_complete')?.value;

            if (portfolioComplete === 'true') {
                return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/settings/:path*', '/onboarding/:path*'],
};


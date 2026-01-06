import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-change-this-in-env';
const key = new TextEncoder().encode(SECRET_KEY);

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key);

    const cookieStore = await cookies();
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

export async function verifySession() {
    // 1. Check for custom JWT session (Credentials login) - Prioritize this!
    // This ensures that if a user switches from OAuth to Credentials, the new session takes precedence
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (session) {
        try {
            const { payload } = await jwtVerify(session, key, {
                algorithms: ['HS256'],
            });
            return payload as { userId: string };
        } catch (error) {
            // Invalid custom session, fall through to NextAuth check
        }
    }

    // 2. Fallback to NextAuth session (OAuth users)
    try {
        const nextAuthSession = await getServerSession(authOptions);
        if (nextAuthSession?.user) {
            const userId = (nextAuthSession.user as any).id;
            if (userId) {
                return { userId };
            }
        }
    } catch (error) {
        // NextAuth session check failed
    }

    return null;
}

export async function logout() {
    const cookieStore = await cookies();

    // Aggressive cleanup: Delete ANY cookie that looks like auth
    const allCookies = cookieStore.getAll();

    for (const cookie of allCookies) {
        if (
            cookie.name.includes('session') ||
            cookie.name.includes('next-auth') ||
            cookie.name.includes('csrf') ||
            cookie.name.includes('callback')
        ) {
            cookieStore.delete(cookie.name);
            // Also try deleting with secure options just in case
            cookieStore.set(cookie.name, '', { maxAge: 0, path: '/' });
        }
    }
}

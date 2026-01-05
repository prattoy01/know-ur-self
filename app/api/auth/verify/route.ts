import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 });
        }

        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token }
        });

        if (!verificationToken) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        if (new Date() > verificationToken.expires) {
            return NextResponse.json({ error: 'Token expired' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: verificationToken.identifier }
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'Email does not exist' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() }
        });

        await prisma.verificationToken.delete({
            where: { token }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

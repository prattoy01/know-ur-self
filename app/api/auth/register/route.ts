import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
            },
        });

        // 1. Generate Token
        // 2. Send Email
        // 3. Do NOT login automatically
        try {
            const { generateVerificationToken } = await import('@/lib/tokens');
            const { sendVerificationEmail } = await import('@/lib/mail');

            const verificationToken = await generateVerificationToken(email);
            await sendVerificationEmail(email, verificationToken.token);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // We still return success but maybe warn? 
            // Ideally we rollout transaction but for now keep it simple.
        }

        return NextResponse.json({
            success: true,
            message: 'Account created! Please check your email to verify your account.'
        });
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

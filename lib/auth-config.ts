import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.passwordHash) {
                    throw new Error('Invalid credentials');
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isCorrectPassword) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user.id,
                    email: user.email!,
                    name: user.name,
                    image: user.profilePhoto,
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.sub!;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
        async redirect({ url, baseUrl }) {
            // Handle callback redirect - always go to dashboard after OAuth
            if (url.includes('/api/auth/callback')) {
                return `${baseUrl}/dashboard`;
            }
            // Allows relative callback URLs
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url;
            return `${baseUrl}/dashboard`;
        },
        async signIn({ user, account }) {
            // For OAuth sign-ins, auto-complete portfolio for new/existing users
            if (account?.provider !== 'credentials' && user.email) {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email },
                    });

                    if (existingUser && !existingUser.portfolioComplete) {
                        // Auto-complete portfolio for existing OAuth users
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: {
                                portfolioComplete: true,
                                profilePhoto: user.image || existingUser.profilePhoto,
                            },
                        });
                    }
                } catch (error) {
                    console.error('Error in signIn callback:', error);
                    // Don't block sign-in on error
                }
            }
            return true;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

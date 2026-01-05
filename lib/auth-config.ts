import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';

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
                    image: user.image || user.profilePhoto,
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub!;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
        async signIn({ user, account, profile }) {
            // For OAuth sign-ins
            if (account?.provider !== 'credentials') {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                    });

                    // If user exists but is signing in with OAuth for first time
                    if (existingUser && !existingUser.portfolioComplete) {
                        // Auto-complete portfolio for OAuth users
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: {
                                portfolioComplete: true,
                                image: user.image,
                            },
                        });
                    }

                    // For new OAuth users
                    if (!existingUser) {
                        // Create user with portfolio completed
                        await prisma.user.create({
                            data: {
                                email: user.email!,
                                name: user.name || 'User',
                                image: user.image,
                                emailVerified: new Date(),
                                portfolioComplete: true,
                            },
                        });
                    }
                } catch (error) {
                    console.error('Error in signIn callback:', error);
                    return false;
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

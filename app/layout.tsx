import { Outfit } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'AntiGravity Productivity',
    description: 'Track your life, budget, and studies.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                const theme = localStorage.getItem('theme') || 
                                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                                document.documentElement.setAttribute('data-theme', theme);
                            })();
                        `,
                    }}
                />
            </head>
            <body className={outfit.className}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}


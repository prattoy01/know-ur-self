import { notFound } from 'next/navigation';
import PortfolioClient from '@/components/PortfolioClient';

// Reserved paths that should NOT be handled by the slug route
const RESERVED_PATHS = [
    'admin',
    'api',
    'dashboard',
    'login',
    'register',
    'verify',
    'onboarding',
    'forgot-password',
    'u',
];

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function PortfolioPage({ params }: PageProps) {
    const { slug } = await params;

    // If slug matches a reserved path, show 404 (let Next.js route to actual folder)
    if (RESERVED_PATHS.includes(slug.toLowerCase())) {
        notFound();
    }

    return <PortfolioClient />;
}

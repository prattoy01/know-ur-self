import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PublicPortfolio from '@/components/PublicPortfolio';

interface Props {
    params: Promise<{ username: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;

    const user = await prisma.user.findUnique({
        where: { username },
        select: { name: true, headline: true, bio: true },
    });

    if (!user) {
        return { title: 'Portfolio Not Found' };
    }

    return {
        title: `${user.name || username} | Portfolio`,
        description: user.headline || user.bio?.substring(0, 160) || `${user.name}'s portfolio`,
        openGraph: {
            title: `${user.name || username} | Portfolio`,
            description: user.headline || user.bio?.substring(0, 160) || `${user.name}'s portfolio`,
            type: 'profile',
        },
    };
}

export default async function PublicPortfolioPage({ params }: Props) {
    const { username } = await params;

    // Fetch user with all public data
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            portfolio: true,
            portfolioSkills: {
                where: { isVisible: true },
                orderBy: { order: 'asc' },
            },
            education: {
                where: { isVisible: true },
                orderBy: { order: 'asc' },
            },
            projects: {
                where: { isVisible: true },
                orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
            },
            achievements: {
                where: { isVisible: true },
                orderBy: { order: 'asc' },
            },
            contactLinks: {
                where: { isVisible: true },
                orderBy: { order: 'asc' },
            },
            cpStats: {
                where: { isVisible: true },
                orderBy: { order: 'asc' },
            },
        },
    });

    // Check if user exists
    if (!user) {
        notFound();
    }

    // Check if portfolio is public
    if (!user.portfolio?.isPublic) {
        notFound();
    }

    // Check if portfolio is complete
    if (!user.portfolioComplete) {
        notFound();
    }

    // Prepare data respecting visibility settings
    const portfolio = user.portfolio;
    const data = {
        name: user.name || '',
        headline: user.headline || '',
        location: user.location || '',
        profilePhoto: user.profilePhoto || '',
        bio: portfolio.showAbout ? (user.bio || '') : '',
        careerGoal: portfolio.showAbout ? (user.careerGoal || '') : '',
        resumeUrl: user.resumeUrl || null,
        rating: portfolio.showRating ? user.rating : null,
        rank: portfolio.showRating ? user.rank : null,
        skills: portfolio.showSkills ? user.portfolioSkills : [],
        education: portfolio.showEducation ? user.education : [],
        projects: portfolio.showProjects ? user.projects : [],
        achievements: portfolio.showAchievements ? user.achievements : [],
        links: portfolio.showContact ? user.contactLinks : [],
        cpStats: user.cpStats,
        settings: {
            showStats: portfolio.showStats,
            showRating: portfolio.showRating,
            showAbout: portfolio.showAbout,
            showEducation: portfolio.showEducation,
            showSkills: portfolio.showSkills,
            showProjects: portfolio.showProjects,
            showAchievements: portfolio.showAchievements,
            showContact: portfolio.showContact,
        },
    };

    return <PublicPortfolio data={data} />;
}

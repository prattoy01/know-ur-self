import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

interface SkillInput {
    id?: string;
    name: string;
    level: string;
    category: string;
    isVisible: boolean;
}

interface EducationInput {
    id?: string;
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number | null;
    gpa: string;
    isVisible: boolean;
}

interface ProjectInput {
    id?: string;
    title: string;
    description: string;
    technologies: string;
    liveUrl: string;
    repoUrl: string;
    isFeatured: boolean;
    isVisible: boolean;
}

interface AchievementInput {
    id?: string;
    title: string;
    subtitle: string;
    rank: string;
    organizer: string;
    date: string;
    isVisible: boolean;
}

interface LinkInput {
    id?: string;
    type: string;
    url: string;
    label: string;
    isVisible: boolean;
}

interface CPStatsInput {
    id?: string;
    platform: string;
    handle: string;
    maxRating: number | null;
    currentRating: number | null;
    rank: string;
    problemsSolved: number | null;
    contestsCount: number | null;
    profileUrl: string;
    isVisible: boolean;
}

// GET: Fetch all portfolio data for editing
export async function GET() {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                portfolioSkills: { orderBy: { order: 'asc' } },
                education: { orderBy: { order: 'asc' } },
                projects: { orderBy: { order: 'asc' } },
                achievements: { orderBy: { order: 'asc' } },
                contactLinks: { orderBy: { order: 'asc' } },
                cpStats: { orderBy: { order: 'asc' } },
                portfolio: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                name: user.name,
                username: user.username,
                headline: user.headline,
                location: user.location,
                profilePhoto: user.profilePhoto,
                resumeUrl: user.resumeUrl,
                bio: user.bio,
                careerGoal: user.careerGoal,
            },
            skills: user.portfolioSkills.map(s => ({
                id: s.id,
                name: s.name,
                level: s.level,
                category: s.category || 'Other',
                isVisible: s.isVisible,
            })),
            education: user.education.map(e => ({
                id: e.id,
                institution: e.institution,
                degree: e.degree,
                field: e.field || '',
                startYear: e.startYear,
                endYear: e.endYear,
                gpa: e.gpa || '',
                isVisible: e.isVisible,
            })),
            projects: user.projects.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description || '',
                technologies: p.technologies || '',
                liveUrl: p.liveUrl || '',
                repoUrl: p.repoUrl || '',
                isFeatured: p.isFeatured,
                isVisible: p.isVisible,
            })),
            achievements: user.achievements.map(a => ({
                id: a.id,
                title: a.title,
                subtitle: a.subtitle || '',
                rank: a.rank || '',
                organizer: a.organizer || '',
                date: a.date?.toISOString().split('T')[0] || '',
                isVisible: a.isVisible,
            })),
            links: user.contactLinks.map(l => ({
                id: l.id,
                type: l.type,
                url: l.url,
                label: l.label || '',
                isVisible: l.isVisible,
            })),
            cpStats: user.cpStats.map((c: any) => ({
                id: c.id,
                platform: c.platform,
                handle: c.handle || '',
                maxRating: c.maxRating,
                currentRating: c.currentRating,
                rank: c.rank || '',
                problemsSolved: c.problemsSolved,
                contestsCount: c.contestsCount,
                profileUrl: c.profileUrl || '',
                isVisible: c.isVisible,
            })),
            settings: user.portfolio ? {
                isPublic: user.portfolio.isPublic,
                showStats: user.portfolio.showStats,
                showRating: user.portfolio.showRating,
                showAbout: user.portfolio.showAbout,
                showEducation: user.portfolio.showEducation,
                showSkills: user.portfolio.showSkills,
                showProjects: user.portfolio.showProjects,
                showAchievements: user.portfolio.showAchievements,
                showContact: user.portfolio.showContact,
            } : null,
        });
    } catch (error) {
        console.error('Portfolio Editor GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Save all portfolio data
export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { user, skills, education, projects, achievements, links, cpStats, settings } = await request.json();

        // Validate username uniqueness
        if (user.username) {
            const existingUser = await prisma.user.findUnique({
                where: { username: user.username },
            });

            if (existingUser && existingUser.id !== session.userId) {
                return NextResponse.json({ error: 'This username is already taken' }, { status: 409 });
            }
        }

        // Transaction to update everything
        await prisma.$transaction(async (tx: any) => {
            // 1. Update User
            await tx.user.update({
                where: { id: session.userId },
                data: {
                    name: user.name,
                    username: user.username,
                    headline: user.headline,
                    location: user.location,
                    profilePhoto: user.profilePhoto,
                    resumeUrl: user.resumeUrl,
                    bio: user.bio,
                    careerGoal: user.careerGoal,
                },
            });

            // 2. Replace Skills
            await tx.portfolioSkill.deleteMany({ where: { userId: session.userId } });
            if (skills && skills.length > 0) {
                await tx.portfolioSkill.createMany({
                    data: skills.map((s: SkillInput, i: number) => ({
                        userId: session.userId,
                        name: s.name,
                        level: s.level,
                        category: s.category || 'Other',
                        isVisible: s.isVisible ?? true,
                        order: i,
                    })),
                });
            }

            // 3. Replace Education
            await tx.portfolioEducation.deleteMany({ where: { userId: session.userId } });
            if (education && education.length > 0) {
                await tx.portfolioEducation.createMany({
                    data: education.map((e: EducationInput, i: number) => ({
                        userId: session.userId,
                        institution: e.institution,
                        degree: e.degree,
                        field: e.field || null,
                        startYear: e.startYear,
                        endYear: e.endYear,
                        gpa: e.gpa || null,
                        isVisible: e.isVisible ?? true,
                        order: i,
                    })),
                });
            }

            // 4. Replace Projects
            await tx.portfolioProject.deleteMany({ where: { userId: session.userId } });
            if (projects && projects.length > 0) {
                await tx.portfolioProject.createMany({
                    data: projects.map((p: ProjectInput, i: number) => ({
                        userId: session.userId,
                        title: p.title,
                        description: p.description || null,
                        technologies: p.technologies || null,
                        liveUrl: p.liveUrl || null,
                        repoUrl: p.repoUrl || null,
                        isFeatured: p.isFeatured ?? false,
                        isVisible: p.isVisible ?? true,
                        order: i,
                    })),
                });
            }

            // 5. Replace Achievements
            await tx.portfolioAchievement.deleteMany({ where: { userId: session.userId } });
            if (achievements && achievements.length > 0) {
                await tx.portfolioAchievement.createMany({
                    data: achievements.map((a: AchievementInput, i: number) => ({
                        userId: session.userId,
                        title: a.title,
                        subtitle: a.subtitle || null,
                        rank: a.rank || null,
                        organizer: a.organizer || null,
                        date: a.date ? new Date(a.date) : null,
                        isVisible: a.isVisible ?? true,
                        order: i,
                    })),
                });
            }

            // 6. Replace Links
            await tx.portfolioLink.deleteMany({ where: { userId: session.userId } });
            if (links && links.length > 0) {
                await tx.portfolioLink.createMany({
                    data: links.map((l: LinkInput, i: number) => ({
                        userId: session.userId,
                        type: l.type,
                        url: l.url,
                        label: l.label || null,
                        isVisible: l.isVisible ?? true,
                        order: i,
                    })),
                });
            }

            // 7. Replace CP Stats
            await tx.portfolioCPStats.deleteMany({ where: { userId: session.userId } });
            if (cpStats && cpStats.length > 0) {
                await tx.portfolioCPStats.createMany({
                    data: cpStats.map((c: CPStatsInput, i: number) => ({
                        userId: session.userId,
                        platform: c.platform,
                        handle: c.handle || null,
                        maxRating: c.maxRating,
                        currentRating: c.currentRating,
                        rank: c.rank || null,
                        problemsSolved: c.problemsSolved,
                        contestsCount: c.contestsCount,
                        profileUrl: c.profileUrl || null,
                        isVisible: c.isVisible ?? true,
                        order: i,
                    })),
                });
            }

            // 8. Upsert Portfolio Settings
            if (settings) {
                await tx.portfolioSettings.upsert({
                    where: { userId: session.userId },
                    create: {
                        userId: session.userId,
                        isPublic: settings.isPublic ?? true,
                        showStats: settings.showStats ?? true,
                        showRating: settings.showRating ?? true,
                        showAbout: settings.showAbout ?? true,
                        showEducation: settings.showEducation ?? true,
                        showSkills: settings.showSkills ?? true,
                        showProjects: settings.showProjects ?? true,
                        showAchievements: settings.showAchievements ?? true,
                        showContact: settings.showContact ?? true,
                    },
                    update: {
                        isPublic: settings.isPublic ?? true,
                        showStats: settings.showStats ?? true,
                        showRating: settings.showRating ?? true,
                        showAbout: settings.showAbout ?? true,
                        showEducation: settings.showEducation ?? true,
                        showSkills: settings.showSkills ?? true,
                        showProjects: settings.showProjects ?? true,
                        showAchievements: settings.showAchievements ?? true,
                        showContact: settings.showContact ?? true,
                    },
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Portfolio Editor POST Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

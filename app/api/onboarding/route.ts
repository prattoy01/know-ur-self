import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

// GET: Fetch current onboarding state
export async function GET() {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                portfolioSkills: {
                    orderBy: { order: 'asc' },
                },
                education: {
                    orderBy: { order: 'asc' },
                },
                contactLinks: {
                    orderBy: { order: 'asc' },
                },
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
                bio: user.bio,
                careerGoal: user.careerGoal,
                portfolioComplete: user.portfolioComplete,
            },
            skills: user.portfolioSkills.map((s: any) => ({
                name: s.name,
                level: s.level,
                category: s.category,
            })),
            education: user.education.map((e: any) => ({
                institution: e.institution,
                degree: e.degree,
                field: e.field,
                startYear: e.startYear,
                endYear: e.endYear,
            })),
            links: user.contactLinks.map((l: any) => ({
                type: l.type,
                url: l.url,
                label: l.label,
            })),
        });
    } catch (error) {
        console.error('Onboarding GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Save onboarding step data
export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { step, data } = await request.json();

        // Validate username uniqueness if provided
        if (data.username) {
            const existingUser = await prisma.user.findUnique({
                where: { username: data.username },
            });

            if (existingUser && existingUser.id !== session.userId) {
                return NextResponse.json({ error: 'This username is already taken' }, { status: 409 });
            }
        }

        // Update user basic fields (always update these)
        await prisma.user.update({
            where: { id: session.userId },
            data: {
                name: data.name,
                username: data.username,
                headline: data.headline,
                location: data.location,
                profilePhoto: data.profilePhoto,
                bio: data.bio,
                careerGoal: data.careerGoal,
            },
        });

        // Handle skills (replace all on skills step)
        if (step === 'skills' && data.skills) {
            // Delete existing skills
            await prisma.portfolioSkill.deleteMany({
                where: { userId: session.userId },
            });

            // Create new skills
            await prisma.portfolioSkill.createMany({
                data: data.skills.map((skill: any, index: number) => ({
                    userId: session.userId,
                    name: skill.name,
                    level: skill.level,
                    category: skill.category || 'Other',
                    order: index,
                })),
            });
        }

        // Handle education (replace all on education step)
        if (step === 'education' && data.education) {
            // Delete existing education
            await prisma.portfolioEducation.deleteMany({
                where: { userId: session.userId },
            });

            // Create new education
            await prisma.portfolioEducation.createMany({
                data: data.education.map((edu: any, index: number) => ({
                    userId: session.userId,
                    institution: edu.institution,
                    degree: edu.degree,
                    field: edu.field || null,
                    startYear: edu.startYear,
                    endYear: edu.endYear,
                    order: index,
                })),
            });
        }

        // Handle links (replace all on links step)
        if (step === 'links' && data.links) {
            // Delete existing links
            await prisma.portfolioLink.deleteMany({
                where: { userId: session.userId },
            });

            // Create new links
            await prisma.portfolioLink.createMany({
                data: data.links.map((link: any, index: number) => ({
                    userId: session.userId,
                    type: link.type,
                    url: link.url,
                    label: link.label || null,
                    order: index,
                })),
            });

            // Update portfolio settings for email visibility
            await prisma.portfolioSettings.upsert({
                where: { userId: session.userId },
                create: {
                    userId: session.userId,
                    showContact: data.showEmailPublic ?? true,
                },
                update: {
                    showContact: data.showEmailPublic ?? true,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Onboarding POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

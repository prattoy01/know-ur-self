import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await verifySession();

    // Redirect to login if no session
    if (!session) {
        redirect('/login');
    }

    // Fetch user name and photo
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, profilePhoto: true }
    });

    return (
        <DashboardShell userName={user?.name || 'User'} userPhoto={user?.profilePhoto || undefined}>
            {children}
        </DashboardShell>
    );
}

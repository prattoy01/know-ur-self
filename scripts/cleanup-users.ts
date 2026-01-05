import { prisma } from '../lib/prisma';

async function cleanupDeletedUsers() {
    console.log('🧹 Starting cleanup of deleted users...');

    const deletedUsers = await prisma.user.findMany({
        where: {
            status: 'deleted'
        }
    });

    console.log(`Found ${deletedUsers.length} deleted users.`);

    let fixedCount = 0;

    for (const user of deletedUsers) {
        // Check if email is already renamed
        if (user.email.startsWith('deleted_') || user.email.startsWith('rejected_')) {
            continue;
        }

        console.log(`Fixing user: ${user.email} (ID: ${user.id})`);

        const timestamp = Date.now();
        const newEmail = `deleted_${timestamp}_${user.email}`;
        let newUsername = user.username;

        if (user.username && !user.username.startsWith('deleted_')) {
            newUsername = `deleted_${timestamp}_${user.username}`;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                email: newEmail,
                username: newUsername
            }
        });

        fixedCount++;
        // Add small delay to ensure unique timestamps if script runs super fast
        await new Promise(r => setTimeout(r, 10));
    }

    console.log(`✅ Cleanup complete! Fixed ${fixedCount} users.`);
}

cleanupDeletedUsers()
    .catch(console.error)
    .finally(() => process.exit(0));

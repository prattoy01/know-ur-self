import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'admin@knowurself.com' },
        update: {
            isAdmin: true,
            role: 'admin',
            emailVerified: new Date(),
            status: 'active'
        },
        create: {
            email: 'admin@knowurself.com',
            passwordHash,
            name: 'Admin',
            isAdmin: true,
            role: 'admin',
            emailVerified: new Date(),
            status: 'active',
            portfolioComplete: true
        }
    });

    console.log('✅ Admin user created!');
    console.log('Email: admin@knowurself.com');
    console.log('Password: Admin@123');
}

createAdmin()
    .catch(console.error)
    .finally(() => process.exit(0));

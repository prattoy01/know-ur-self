import { prisma } from "@/lib/prisma";

export const generateVerificationToken = async (email: string) => {
    const token = crypto.randomUUID();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour expiration

    // Remove existing tokens for this email
    await prisma.verificationToken.deleteMany({
        where: { identifier: email }
    });

    // Create new token
    const verificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        }
    });

    return verificationToken;
};

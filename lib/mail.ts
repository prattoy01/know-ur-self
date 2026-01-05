export const sendVerificationEmail = async (email: string, token: string) => {
    // Use Vercel URL if available, else localhost
    // Note: For dev, usually localhost is simpler. When deploying, we need env var.
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmLink = `${domain}/verify?token=${token}`;

    console.log("\n========================================");
    console.log(`📧 MOCK EMAIL TO: ${email}`);
    console.log(`🔗 VERIFY LINK: ${confirmLink}`);
    console.log("========================================\n");

    // Implementation for real email service would go here:
    // await resend.emails.send({ ... })
};

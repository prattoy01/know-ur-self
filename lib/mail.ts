import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmLink = `${domain}/verify?token=${token}`;

    try {
        await resend.emails.send({
            from: 'Know Ur Self <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your email - Know Ur Self',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #1a1a2e; text-align: center;">Welcome to Know Ur Self! 🎯</h1>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Thanks for signing up! Please verify your email address by clicking the button below:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${confirmLink}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                  color: white;
                                  padding: 14px 28px;
                                  text-decoration: none;
                                  border-radius: 8px;
                                  font-weight: bold;
                                  display: inline-block;">
                            Verify Email
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        Or copy and paste this link in your browser:<br/>
                        <a href="${confirmLink}" style="color: #667eea;">${confirmLink}</a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
            `,
        });
        console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

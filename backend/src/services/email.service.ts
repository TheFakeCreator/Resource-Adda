import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "fallback_key");

export const sendVerificationEmail = async (
  to: string,
  token: string,
): Promise<boolean> => {
  try {
    // If running in development without a proper key, just simulate success
    // This allows local testing without needing a real API key immediately
    if (!process.env.RESEND_API_KEY) {
      console.log("==========================================");
      console.log("🛠️ DEVELOPMENT MODE: Verification Email");
      console.log(`To: ${to}`);
      console.log(`Token: ${token}`);
      console.log(
        `Link: ${process.env.FRONTEND_URLS?.split(",")[0] || "http://localhost:3000"}/verify-email?token=${token}`,
      );
      console.log("==========================================");
      return true;
    }

    const frontendUrl =
      process.env.FRONTEND_URLS?.split(",")[0] || "http://localhost:3000";
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    const data = await resend.emails.send({
      from: "Resource-Adda <onboarding@resend.dev>", // Change this to your verified domain in production
      to: [to],
      subject: "Verify your email address - Resource-Adda",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Resource-Adda!</h2>
          <p>Please click the button below to verify your email address and activate your account.</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px;">
            Verify Email
          </a>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            If you did not create an account, no further action is required.
          </p>
          <p style="margin-top: 10px; font-size: 12px; color: #666;">
            Or copy and paste this link into your browser:<br>
            <a href="${verificationLink}">${verificationLink}</a>
          </p>
        </div>
      `,
    });

    if (data.error) {
      console.error("Resend API Error:", data.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  token: string,
): Promise<boolean> => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("==========================================");
      console.log("🛠️ DEVELOPMENT MODE: Password Reset Email");
      console.log(`To: ${to}`);
      console.log(`Token: ${token}`);
      console.log(
        `Link: ${process.env.FRONTEND_URLS?.split(",")[0] || "http://localhost:3000"}/reset-password?token=${token}`,
      );
      console.log("==========================================");
      return true;
    }

    const frontendUrl =
      process.env.FRONTEND_URLS?.split(",")[0] || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const data = await resend.emails.send({
      from: "Resource-Adda <onboarding@resend.dev>", // Change this to your verified domain in production
      to: [to],
      subject: "Password Reset Request - Resource-Adda",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Please click the button below to set a new password.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px;">
            Reset Password
          </a>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            If you did not request a password reset, you can safely ignore this email. This link will expire in 1 hour.
          </p>
          <p style="margin-top: 10px; font-size: 12px; color: #666;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetLink}">${resetLink}</a>
          </p>
        </div>
      `,
    });

    if (data.error) {
      console.error("Resend API Error:", data.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
};

// auth/emailService.ts
import nodemailer from "nodemailer";

const SMTP_CONFIG = {
  host: "mail.privateemail.com",
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};
const transporter = nodemailer.createTransport(SMTP_CONFIG);

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: { name: "Repeddle", address: "support@repeddle.com" },
      to: email,
      subject: "Email Verification",
      text: `Click the following link to verify your email: https://repeddle-frontend.vercel.app/auth/verify/${token}`,
    });
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

export const sendResetPasswordEmail = async (
  email: string,
  resetToken: string
) => {
  try {
    // Define email options
    const mailOptions = {
      from: { name: "Repeddle", address: "support@repeddle.com" },
      to: email,
      subject: "Reset Your Password",
      html: `<p>Please click the following link to reset your password:</p><p>https://repeddle-frontend.vercel.app/auth/reset-password/${resetToken}</p>`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw new Error("Error sending reset password email");
  }
};

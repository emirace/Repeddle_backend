// auth/emailService.ts
import nodemailer from 'nodemailer';

const SMTP_CONFIG = {
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-smtp-username',
    pass: 'your-smtp-password',
  },
};

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  try {
    const transporter = nodemailer.createTransport(SMTP_CONFIG);
    await transporter.sendMail({
      from: 'your-email@example.com',
      to: email,
      subject: 'Email Verification',
      text: `Click the following link to verify your email: http://example.com/verify-email/${token}`,
    });
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

export const sendResetPasswordEmail = async (
  email: string,
  resetToken: string
) => {
  try {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'your_email_service_provider',
      auth: {
        user: 'your_email_address',
        pass: 'your_email_password',
      },
    });

    // Define email options
    const mailOptions = {
      from: 'your_email_address',
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Please click the following link to reset your password:</p><p><a href="http://yourwebsite.com/reset-password/${resetToken}">Reset Password</a></p>`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending reset password email:', error);
    throw new Error('Error sending reset password email');
  }
};

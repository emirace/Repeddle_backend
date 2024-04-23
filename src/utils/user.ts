import { secretKey } from '../config/env';
import jwt from 'jsonwebtoken';
import User from '../model/user';

// Function to generate an access token
export async function generateAccessToken(userId: string): Promise<string> {
  if (!secretKey) {
    throw new Error('Secret key not found');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('user not found');
  }
  user.tokenVersion += 1;
  user.save();
  const token = jwt.sign(
    { userId, email: user.email, version: user.tokenVersion },
    secretKey,
    {
      expiresIn: '30d',
    }
  ); // Adjust the expiration time as needed
  return token;
}

export function generateEmailVerificationToken(email: string): string {
  if (!secretKey) {
    throw new Error('Secret key not found');
  }
  return jwt.sign({ email }, secretKey, { expiresIn: '1h' });
}

export function verifyEmailVerificationToken(token: string): string | null {
  try {
    if (!secretKey) {
      throw new Error('Secret key not found');
    }
    const decoded = jwt.verify(token, secretKey) as { email: string };
    return decoded.email;
  } catch (error) {
    console.error('Error verifying email verification token:', error);
    return null;
  }
}

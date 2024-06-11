import { secretKey } from "../config/env";
import jwt from "jsonwebtoken";
import User from "../model/user";
import Token from "../model/token";

// Function to generate an access token
export async function generateAccessToken(userId: string): Promise<string> {
  if (!secretKey) {
    throw new Error("Secret key not found");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("user not found");
  }
  user.tokenVersion += 1;
  user.save();
  const token = jwt.sign(
    { userId, email: user.email, version: user.tokenVersion },
    secretKey,
    {
      expiresIn: "30d",
    }
  ); // Adjust the expiration time as needed
  return token;
}

export async function generateEmailVerificationToken(
  email: string,
  type: "email" | "password"
): Promise<string> {
  if (!secretKey) {
    throw new Error("Secret key not found");
  }

  const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
  await Token.create({ type, token });

  return token;
}

export async function verifyEmailVerificationToken(
  token: string,
  type: string
): Promise<string | null> {
  try {
    if (!secretKey) {
      console.error("Secret key not found");
      return null;
    }

    const tokenDoc = await Token.findOne({ token, type });

    if (!tokenDoc) {
      console.error("Invalid token");
      return null;
    }

    if (tokenDoc.used) {
      console.error("Token has already been used");
      return null;
    }

    const decoded = jwt.verify(token, secretKey) as { email: string };
    await Token.updateOne({ token }, { $set: { used: true } });
    return decoded.email;
  } catch (error) {
    console.error("Error verifying email verification token:", error);
    return null;
  }
}

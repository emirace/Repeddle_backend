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

// Helper function to generate a random 5-digit OTP
function generateOtp(): string {
  return String(Math.floor(10000 + Math.random() * 90000)); // Ensures 5 digits
}

// Generate token or OTP
export async function generateEmailVerificationToken({
  email,
  type,
  mode,
}: {
  email: string;
  type: "email" | "password";
  mode: "token" | "otp";
}): Promise<string> {
  if (mode === "token") {
    if (!secretKey) {
      throw new Error("Secret key not found");
    }
    const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });

    // If the type is "password", store the token in the database
    if (type === "password") {
      await Token.create({ email, type, token });
    }

    return token;
  } else if (mode === "otp") {
    const otp = generateOtp();
    const currentTime = new Date();
    const expiresAt = new Date(currentTime.getTime() + 10 * 60 * 1000);

    // Store the OTP in the database
    await Token.create({
      email,
      type,
      otp,
      expiresAt,
      used: false,
    });

    return otp;
  }

  throw new Error("Invalid mode");
}

// Verify token or OTP
export async function verifyEmailVerificationToken({
  identifier,
  type,
  mode = "token",
}: {
  identifier: string;
  type: "email" | "password";
  mode?: "token" | "otp";
}): Promise<string | null> {
  try {
    if (mode === "token") {
      if (!secretKey) {
        console.error("Secret key not found");
        return null;
      }

      // For password type, check the database for the token
      if (type === "password") {
        const tokenDoc = await Token.findOne({ token: identifier, type });
        if (!tokenDoc) {
          console.error("Invalid token");
          return null;
        }
        if (tokenDoc.used) {
          console.error("Token has already been used");
          return null;
        }
      }

      // Verify the token
      const decoded = jwt.verify(identifier, secretKey) as { email: string };

      if (type === "password") {
        // Mark the token as used
        await Token.updateOne({ token: identifier }, { $set: { used: true } });
      }

      return decoded.email;
    } else if (mode === "otp") {
      console.log(identifier, mode, type);
      // Find the OTP in the database
      const tokenDoc = await Token.findOne({ otp: identifier, type });
      if (!tokenDoc) {
        console.error("Invalid OTP");
        return null;
      }

      // Check if the OTP is expired
      if (tokenDoc.expiresAt < new Date()) {
        console.error("OTP has expired");
        return null;
      }

      // Check if the OTP has already been used
      if (tokenDoc.used) {
        console.error("OTP has already been used");
        return null;
      }

      // Mark the OTP as used
      if (type === "password") {
        await Token.updateOne({ _id: tokenDoc._id }, { $set: { used: true } });
      }
      return tokenDoc.email;
    }

    throw new Error("Invalid mode");
  } catch (error) {
    console.error("Error verifying:", error);
    return null;
  }
}

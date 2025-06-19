import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import User, { IUser } from "../model/user";
import geoip from "geoip-lite";

export interface CustomRequest extends Request {
  userId?: string;
  userRegion?: "ZAR" | "NGN";
  isAdmin?: boolean;
  userRole?: string;
}

// Middleware for authorization
export const authorize = (requiredRoles?: ("Admin" | "User" | "Guest")[]) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      // Extract the access token from the request headers or query params
      const accessToken = String(
        req.headers.authorization?.split(" ")[1] || req.query.accessToken
      );

      if (!accessToken) {
        return res.status(401).json({ message: "Access token is missing" });
      }
      const secretKey = process.env.JWT_SECRET;

      if (!secretKey) {
        return res
          .status(500)
          .json({ message: "JWT secret key is not configured" });
      }

      // Verify the access token
      const decoded: any = jwt.verify(accessToken, secretKey);

      // Check if the token version matches the user's tokenVersion
      const user: IUser | null = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "Invalid user token" });
      }

      if (decoded.version + 2 <= user.tokenVersion) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Check if a required role is specified
      if (
        requiredRoles &&
        requiredRoles.length > 0 &&
        !requiredRoles.includes(user.role)
      ) {
        return res.status(403).json({ message: "Access forbidden" });
      }

      // Attach user data to the request object for use in the route handler
      req.userId = (user._id as string).toString();
      req.isAdmin = user.role === "Admin";
      req.userRole = user.role;

      // Continue to the next middleware or route handler
      next();
    } catch (error) {
      console.log("error", error);
      if (error instanceof TokenExpiredError) {
        return res.status(403).json({ message: "Token expired" });
      } else {
        return res.status(403).json({ message: "Invalid token" });
      }
    }
  };
};

// Middleware to extract user's region from the request headers
export const extractUserRegion = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const testIp = ip === "::1" || ip === "127.0.0.1" ? "8.8.8.8" : ip;
  console.log(testIp);
  const geo = geoip.lookup(testIp as string);

  if (!geo) {
    return res.status(404).json({ error: "Country not found for this IP" });
  }

  const region = geo.country;
  console.log("region", region);

  req.userRegion = region === "ZAR" ? "ZAR" : "NGN";

  next();
};

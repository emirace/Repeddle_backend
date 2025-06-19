import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import User, { IUser } from "../model/user";

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
      req.userId = user._id.toString();
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
  // Get the user's region from the 'cloudfront-viewer-country' header
  const region = req.headers["cf-ipcountry"] || "UNKNOWN";
  console.log("region", region);

  // If the region is not found in the header or is empty, send an error response
  // if (!region) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: 'User location not provided' });
  // }

  req.userRegion = (region as "ZAR" | "NGN") || "NGN";

  next();
};

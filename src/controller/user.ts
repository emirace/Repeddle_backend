// userController.ts
import { Request, Response } from "express";
import User, { IAddress, IRebundle, IUser } from "../model/user";
import {
  generateAccessToken,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
} from "../utils/user";
import { sendResetPasswordEmail, sendVerificationEmail } from "../utils/email";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { CustomRequest } from "../middleware/user";
import Product from "../model/product";

const generateRandomNumber = () => {
  return Math.floor(Math.random() * 100);
};

interface UpdateFields {
  usernameLastUpdated: Date;
  username?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  about?: string;
  dob?: Date;
  isSeller: boolean;
  role: string;
  accountNumber?: number;
  phone?: string;
  accountName?: string;
  password: string;
  allowNewsletter: boolean;
  bankName?: string;
  address?: IAddress;
  rebundle?: IRebundle;
  badge?: boolean;
  active?: boolean;
}

const UserController = {
  // Send verification email
  async sendVerificationEmail(req: Request, res: Response) {
    try {
      await Promise.all([
        body("email").isEmail().escape().withMessage("Invalid email format"),
      ]);

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }
      const email = req.body.email;

      if (!email) {
        return res
          .status(400)
          .json({ status: false, message: "Email address is required" });
      }

      const user = await User.findOne({ email, role: "Guest" });
      if (user) {
        // Generate reset password token
        const resetToken = await generateEmailVerificationToken(
          user.email,
          "password"
        );

        // Send reset password email
        await sendResetPasswordEmail(user.email, resetToken);
      } else {
        const token = await generateEmailVerificationToken(email, "email");
        await sendVerificationEmail(email, token);
      }
      res.status(200).json({
        status: true,
        message: "Verification email sent successfully",
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      res
        .status(500)
        .json({ status: false, message: "Error sending verification email" });
    }
  },

  // Verify email with token
  async verifyEmail(req: Request, res: Response) {
    try {
      const token = req.params.token;
      const email = await verifyEmailVerificationToken(token, "email");

      if (!email) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid or expired token" });
      }
      // Implement user account creation or update here
      res
        .status(200)
        .json({ status: true, message: "Email verified successfully", email });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ status: false, message: "Error verifying email" });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      // Generate reset password token
      const resetToken = await generateEmailVerificationToken(
        user.email,
        "password"
      );

      // Send reset password email
      await sendResetPasswordEmail(user.email, resetToken);

      // Send status response
      return res.status(200).json({
        status: true,
        message: "Reset password email sent successfully",
      });
    } catch (error) {
      console.error("Error sending reset password email:", error);
      return res.status(500).json({
        status: false,
        message: "Error sending reset password email",
      });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { password } = req.body;
      const token = req.params.token;
      console.log(token);
      // Verify reset token
      const email = await verifyEmailVerificationToken(token, "password");
      console.log(email, token);
      if (!email) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid token or user not found" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user's password
      user.password = hashedPassword;
      await user.save();

      res
        .status(200)
        .json({ status: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Error resetting password" });
    }
  },

  async register(req: CustomRequest, res: Response) {
    try {
      await Promise.all([
        body("token").notEmpty().withMessage("Token is required"),
        body("username").notEmpty().withMessage("Username is required"),
        body("password")
          .isLength({ min: 8 })
          .withMessage("Password must be at least 8 characters long"),
        body("firstName").notEmpty().withMessage("First name is required"),
        body("lastName").notEmpty().withMessage("Last name is required"),
        body("phone").isMobilePhone("any").withMessage("Invalid phone number"),
      ]);

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const {
        username,
        password,
        firstName,
        lastName,
        phone,
        token: verificationToken,
      } = req.body;
      const region = req.userRegion;
      const email = await verifyEmailVerificationToken(
        verificationToken,
        "email"
      );
      if (!email) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid or expired token" });
      }

      const existEmail = await User.findOne({ email });
      if (existEmail && existEmail.role !== "Guest") {
        return res
          .status(400)
          .json({ status: false, message: "Email already exist" });
      }

      const existUsername = await User.findOne({ username });
      if (existUsername) {
        return res
          .status(400)
          .json({ status: false, errors: "Username already exist" });
      }

      // Hash the password before storing it in the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user
      const newUser = await User.findOneAndUpdate(
        { email, role: "Guest" },
        {
          $set: {
            username,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            region,
            role: "User",
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      );

      //TODO

      // create wallet
      // add to newsletter
      //send welcome email

      // Generate JWT token
      const token = await generateAccessToken(newUser._id);

      res.status(201).json({ status: true, token });
    } catch (error) {
      console.error("Error registering user:", error);
      res
        .status(500)
        .json({ status: false, message: "Error registering user", error });
    }
  },

  // Login user
  async login(req: Request, res: Response) {
    try {
      await Promise.all([
        body("email").isEmail().withMessage("Invalid email address"),
      ]);

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user by email
      const user: IUser | null = await User.findOne({
        email,
        deleted: false,
      });

      // If user not found or password does not match, return unauthorized
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = await generateAccessToken(user._id);

      // Return token
      res.status(200).json({ status: true, token });
    } catch (error) {
      console.error("Error logging in:", error);
      res
        .status(500)
        .json({ status: false, message: "Error logging in", error });
    }
  },

  async loginGuest(req: CustomRequest, res: Response) {
    try {
      // Validate input
      await Promise.all([
        body("email").isEmail().withMessage("Invalid email address").run(req),
        body("fullName")
          .notEmpty()
          .withMessage("Full name is required")
          .run(req),
      ]);

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email, fullName } = req.body;
      const region = req.userRegion;

      // Ensure both fullName and email are provided
      if (!fullName || !email) {
        return res.status(400).json({
          success: false,
          message: "Full name and email are required",
        });
      }

      const existUser = await User.findOne({ email });

      if (existUser && existUser.role !== "Guest") {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Update or create guest user
      const user: any = await User.findOneAndUpdate(
        { email, deleted: false, role: "Guest" },
        {
          $set: {
            username: fullName.split(" ")[0] + generateRandomNumber(),
            firstName: fullName.split(" ")[0],
            lastName: fullName.split(" ").slice(1).join(" "),
            email,
            role: "Guest",
            region,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      );

      // Generate JWT token
      const token = await generateAccessToken(user._id);

      // Return token and user
      res
        .status(200)
        .json({ status: true, guestUser: { ...user._doc, token } });
    } catch (error) {
      console.error("Error logging in:", error);
      res
        .status(500)
        .json({ status: false, message: "Error logging in", error });
    }
  },

  // Get user profile
  async getProfile(req: CustomRequest, res: Response) {
    try {
      console.log("i am here");
      const userId = req.userId;
      const user = await User.findById(userId).select(
        "-password -tokenVersion -delected"
      );
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }
      res.status(200).json({ status: true, user });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Error fetching user profile",
        error,
      });
    }
  },

  // Update user profile
  async updateProfile(req: CustomRequest, res: Response) {
    try {
      const userId = req.userId;

      // Extract the fields to be updated from the request body
      let updateFields: UpdateFields = req.body;

      const isEmpty = (value: any) => {
        if (value == null || value === "") return true; // null, undefined, or empty string
        if (typeof value === "object" && !Array.isArray(value)) {
          return Object.keys(value).length === 0; // empty object
        }
        return false;
      };

      // Remove fields without values (null, empty string, or empty object)
      updateFields = Object.fromEntries(
        Object.entries(updateFields).filter(([_, value]) => !isEmpty(value))
      ) as UpdateFields;

      // Fields that can only be updated once
      const onceUpdateFields: (keyof UpdateFields)[] = [
        "accountName",
        "bankName",
        "accountNumber",
      ];

      // Check if any of the fields is not allowed
      const allowedFields: (keyof UpdateFields)[] = [
        "firstName",
        "lastName",
        "image",
        "username",
        "about",
        "dob",
        "phone",
        "address",
        "rebundle",
        "accountName",
        "password",
        "bankName",
        "accountNumber",
        "allowNewsletter",
      ];

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      // Validate allowed fields
      for (const field in updateFields) {
        if (!allowedFields.includes(field as keyof UpdateFields)) {
          return res.status(400).json({
            status: false,
            message: `Field '${field}' is not allowed for update`,
          });
        }
      }

      // Check if username is being updated and enforce the 30-day limit
      if ("username" in updateFields) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (
          user.usernameLastUpdated &&
          user.usernameLastUpdated > thirtyDaysAgo
        ) {
          return res.status(400).json({
            status: false,
            message: "Username can only be updated once every 30 days",
          });
        }
        updateFields.usernameLastUpdated = new Date();
      }

      if ("password" in updateFields) {
        const hashedPassword = await bcrypt.hash(updateFields["password"], 10);
        updateFields.password = hashedPassword;
      }

      // Check if once-update fields are being added or edited for the first time
      for (const field of onceUpdateFields) {
        if (user[field] && field in updateFields) {
          return res.status(400).json({
            status: false,
            message: `${field} has already been added and cannot be edited`,
          });
        }
      }

      if (
        (updateFields.accountNumber || user.accountNumber) &&
        (updateFields.address || user.address)
      ) {
        updateFields.isSeller = true;
      }

      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
        new: true,
      }).select("-password -tokenVersion -delected");

      if (!updatedUser) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      res.status(200).json({ status: true, user: updatedUser });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Error updating user profile",
        error,
      });
    }
  },

  async followUser(req: CustomRequest, res: Response) {
    try {
      const { userId } = req.params;
      const followerId = req.userId;
      if (!followerId) {
        return res
          .status(403)
          .json({ status: false, message: "Access forbidden" });
      }
      const userToUpdate = await User.findById(userId);
      if (!userToUpdate) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      // Check if the user is already being followed
      if (userToUpdate.followers.includes(followerId)) {
        return res
          .status(400)
          .json({ message: "User is already being followed" });
      }
      const currentUser = await User.findById(followerId);

      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // Add the follower to the user's followers list
      userToUpdate.followers.push(followerId);
      currentUser.following.push(userId);
      await userToUpdate.save();
      await currentUser.save();

      res
        .status(200)
        .json({ status: true, message: "User followed successfully" });
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ status: false, message: "Error following user" });
    }
  },

  async unfollowUser(req: CustomRequest, res: Response) {
    try {
      const { userId } = req.params;
      const followerId = req.userId; // Assuming userId is stored in req.userId after authentication

      if (!followerId) {
        return res
          .status(403)
          .json({ status: false, message: "Access forbidden" });
      }

      const [userToUpdate, currentUser] = await Promise.all([
        User.findById(userId),
        User.findById(followerId),
      ]);

      if (!userToUpdate || !currentUser) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      if (!userToUpdate.followers.includes(followerId)) {
        return res
          .status(400)
          .json({ status: false, message: "User is not being followed" });
      }

      // Remove the follower from the user's followers list
      userToUpdate.followers = userToUpdate.followers.filter(
        (id) => id.toString() !== followerId
      );
      await userToUpdate.save();

      // Remove the followed user from the current user's following list
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userId
      );
      await currentUser.save();

      res
        .status(200)
        .json({ status: true, message: "User unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res
        .status(500)
        .json({ status: false, message: "Error unfollowing user" });
    }
  },

  // Delete user account
  async deleteAccount(req: CustomRequest, res: Response) {
    try {
      const userId = req.userId;
      const deletedUser = await User.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }
      res
        .status(200)
        .json({ status: true, message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Error deleting user account",
        error,
      });
    }
  },

  // top sellers
  async getTopSellers(req: Request, res: Response) {
    try {
      // Query the User model to find top sellers based on certain criteria
      const topSellers: IUser[] = await User.find({ isSeller: true })
        .select("username image badge") // Select only necessary fields
        .sort({ sold: -1 }) // Sort by the number of products sold in descending order
        .limit(10); // Limit the result to the top 10 sellers

      // Respond with the list of top sellers
      res.status(200).json({ status: true, topSellers });
    } catch (error) {
      // Handle errors
      console.error("Error fetching top sellers:", error);
      res
        .status(500)
        .json({ status: false, message: "Error fetching top sellers", error });
    }
  },

  //username suggestions
  async getSuggestedUsername(req: Request, res: Response) {
    try {
      const { firstName, lastName, otherText } = req.body;

      // Generate suggested usernames based on firstName, lastName, or otherText
      let suggestedUsernames: string[] = [];
      if (otherText && otherText.length > 3) {
        // Generate usernames based on otherText
        suggestedUsernames.push(
          `${otherText}`,
          `${otherText}${generateRandomNumber()}`
        );
      } else {
        // Generate usernames based on firstName and lastName
        if (firstName) {
          suggestedUsernames.push(
            firstName,
            `${firstName}${generateRandomNumber()}`
          );
        }
        if (lastName) {
          suggestedUsernames.push(
            lastName,
            `${lastName}${generateRandomNumber()}`
          );
        }
        if (firstName && lastName) {
          suggestedUsernames.push(
            `${firstName}_${lastName}`,
            `${firstName}${lastName}`,
            `${firstName}${lastName}${generateRandomNumber()}`
          );
        }
      }

      // Check uniqueness of suggested usernames
      const existingUsernames = await User.find({
        username: { $in: suggestedUsernames },
      }).distinct("username");
      const uniqueUsernames = suggestedUsernames.filter(
        (username) => !existingUsernames.includes(username)
      );

      // If there are less than 3 unique usernames, generate additional ones with random numbers
      let additionalUsernames: string[] = [];
      while (uniqueUsernames.length + additionalUsernames.length < 3) {
        suggestedUsernames.forEach((username) => {
          const newUsername = `${username}${generateRandomNumber()}`;
          if (!existingUsernames.includes(newUsername)) {
            additionalUsernames.push(newUsername);
          }
        });
      }

      // Combine unique and additional usernames to ensure at least 3 suggestions
      const finalUsernames = uniqueUsernames
        .concat(additionalUsernames)
        .slice(0, 3);

      // Respond with suggested unique usernames
      res
        .status(200)
        .json({ status: true, suggestedUsernames: finalUsernames });
    } catch (error) {
      console.error("Error generating suggested usernames:", error);
      res.status(500).json({
        status: false,
        message: "Error generating suggested usernames",
        error,
      });
    }
  },

  async getUserByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;

      if (!username) {
        return res
          .status(400)
          .json({ status: false, message: "Username is required" });
      }

      // Query the User model to find the user by username and populate related fields
      const user = await User.findOne({
        username,
        role: { $ne: "Guest" },
      }).select(
        "username image about rating  followers following numReviews _id rebundle sold buyers createdAt region likes"
      );

      // If user not found, return 404
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      // Fetch all products by the user, sold products, liked products, and selling products
      const [allProducts, soldProducts, likedProducts, sellingProducts] =
        await Promise.all([
          Product.find({ seller: user._id }),
          Product.find({ _id: { $in: user.sold } }),
          Product.find({ _id: { $in: user.wishlist } }),
          Product.find({ seller: user._id, countInStock: { $gt: 0 } }),
        ]);

      // Structure the response data
      const responseData = {
        status: true,
        user,
        products: {
          all: allProducts,
          sold: soldProducts,
          liked: likedProducts,
          selling: sellingProducts,
        },
      };

      // Respond with the user data and products
      res.status(200).json(responseData);
    } catch (error) {
      // Handle errors
      console.error("Error fetching user by username:", error);
      res
        .status(500)
        .json({ status: false, message: "Error fetching user", error });
    }
  },

  // Controller method to get all users with pagination and search
  async getAllUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, search = "" } = req.query;
      const query: any = {};

      // If search parameter is provided, add search logic
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Pagination logic
      const users: IUser[] = await User.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .exec();

      // Get total count of users (without pagination)
      const totalCount: number = await User.countDocuments(query);

      res.json({
        status: true,
        users,
        totalPages: Math.ceil(totalCount / +limit),
        currentPage: +page,
        totalCount,
      });
    } catch (error) {
      // Handle errors
      console.error("Error fetching all users", error);
      res
        .status(500)
        .json({ status: false, message: "Error fetching all users", error });
    }
  },

  async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select(
        "-password -tokenVersion -delected"
      );
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }
      res.status(200).json({ status: true, user });
    } catch (error) {
      console.error("Error getting user by id", error);
      res
        .status(500)
        .json({ status: false, message: "Error getting user by id", error });
    }
  },

  async updateUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Extract the fields to be updated from the request body
      const updateFields: UpdateFields = req.body;

      // Check if any of the fields is not allowed
      const allowedFields: (keyof UpdateFields)[] = [
        "firstName",
        "username",
        "lastName",
        "image",
        "about",
        "dob",
        "phone",
        "address",
        "rebundle",
        "isSeller",
        "accountName",
        "bankName",
        "accountNumber",
        "role",
        "badge",
        "active",
        "allowNewsletter",
      ];

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      // Check if username is being updated and enforce the 30-day limit
      if ("username" in updateFields) {
        const existUsername = await User.findOne({
          username: updateFields.username,
        });
        if (existUsername) {
          return res
            .status(400)
            .json({ status: false, errors: "Username already exist" });
        }
        updateFields.usernameLastUpdated = new Date();
      }

      // Validate allowed fields
      for (const field in updateFields) {
        if (!allowedFields.includes(field as keyof UpdateFields)) {
          return res.status(400).json({
            status: false,
            message: `Field '${field}' is not allowed for update`,
          });
        }
      }

      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
        new: true,
      }).select("-password -tokenVersion -delected");

      if (!updatedUser) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      res.status(200).json({ status: true, user: updatedUser });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Error updating user profile",
        error,
      });
    }
  },

  async addProductToWishlist(req: CustomRequest, res: Response) {
    const { userId } = req;
    const { productId } = req.body;
    try {
      if (!productId) {
        return res
          .status(400)
          .json({ status: false, message: "Product ID is required" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      const productExists = user.wishlist.includes(productId);

      if (productExists) {
        res
          .status(400)
          .json({ status: false, message: "Product already in wishlist" });
        return;
      }
      user.wishlist.push(productId);
      await user.save();

      res.status(201).json({
        status: true,
        message: "Product added to wishlist",
        wishlist: user.wishlist,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Internal server error",
        error,
      });
    }
  },
  async removeProductFromWishList(req: CustomRequest, res: Response) {
    try {
      const { productId } = req.params;
      const userId = req.userId;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ status: false, message: "User not found" });
        return;
      }

      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
      await user.save();

      res.status(200).json({
        status: true,
        message: "Product removed from wishlist",
        wishlist: user.wishlist,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Internal server error",
        error,
      });
    }
  },
  async getUserWishlist(req: CustomRequest, res: Response) {
    try {
      const userId = req.userId;

      const user = await User.findById(userId).populate("wishlist");
      if (!user) {
        res.status(404).json({ status: false, message: "User not found" });
        return;
      }

      res.status(200).json({
        status: true,
        wishlist: user.wishlist,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Internal server error",
        error,
      });
    }
  },

  async submitReview(req: CustomRequest, res: Response) {
    const { userId: sellerId } = req.params;
    const userId = req.userId!;
    const { comment, rating, like } = req.body;

    if (!comment || rating == null) {
      return res
        .status(400)
        .json({ message: "Comment and rating are required" });
    }

    try {
      const seller = await User.findById(sellerId);

      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      // Check if user bought the product
      const hasBoughtProduct = seller.buyers.some(
        (buyerId) => buyerId.toString() === userId
      );
      if (!hasBoughtProduct) {
        return res.status(403).json({
          message: "You can only review sellers you have bought from",
        });
      }

      // Check if user has already reviewed the seller
      const hasReviewed = seller.reviews.some(
        (review) => review.user.toString() === userId
      );
      if (hasReviewed) {
        return res
          .status(403)
          .json({ message: "You have already reviewed this seller" });
      }

      const newReview = {
        user: userId,
        comment,
        rating,
        like,
      };

      seller.reviews.push(newReview);
      seller.rating =
        seller.reviews.reduce((acc, review) => acc + review.rating, 0) /
        seller.reviews.length;
      await seller.save();

      res.status(200).json({ message: "Review submitted", review: newReview });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default UserController;

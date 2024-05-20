// userRoutes.ts
import express from "express";
import UserController from "../controller/user";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

// Get user profile
router.get("/profile", authorize(), UserController.getProfile);

router.get("/admin", authorize(["Admin"]), UserController.getAllUsers);

router.get("/top-sellers", UserController.getTopSellers);

router.get("/:username", UserController.getUserByUsername);

router.get("/admin/:userId", authorize(["Admin"]), UserController.getUserById);

router.get("/verify-email/:token", UserController.verifyEmail);

router.post("/send-verification-email", UserController.sendVerificationEmail);

router.post("/send-verification-email", UserController.sendVerificationEmail);

router.post("/forgot-password", UserController.forgotPassword);

router.post("/register", extractUserRegion, UserController.register);

// Login user
router.post("/login", UserController.login);

// Update user profile
router.put("/profile", authorize(), UserController.updateProfile);

router.put(
  "/admin/:userId",
  authorize(["Admin"]),
  UserController.updateUserById
);

router.post("/suggested-username", UserController.getSuggestedUsername);

router.post("/follow/:userId", authorize(), UserController.followUser);

router.post("/reset-password/:token", UserController.resetPassword);

router.delete("/unfollow/:userId", authorize(), UserController.unfollowUser);

// Delete user account
router.delete("/profile", authorize(), UserController.deleteAccount);

export default router;

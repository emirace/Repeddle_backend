// userRoutes.ts
import express from "express";
import UserController from "../controller/user";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

// Get user profile
router.get("/profile", authorize(), UserController.getProfile);

router.get("/admin", authorize(["Admin"]), UserController.getAllUsers);

router.get("/top-sellers", UserController.getTopSellers);

router.get("/wishlist", authorize(), UserController.getUserWishlist);

router.get("/:username", UserController.getUserByUsername);

router.get("/admin/:userId", authorize(["Admin"]), UserController.getUserById);

router.get("/verify-email/:token", UserController.verifyEmail);

router.post("/send-verification-email", UserController.sendVerificationEmail);

router.post("/send-verification-email", UserController.sendVerificationEmail);

router.post("/forgot-password", UserController.forgotPassword);

router.post("/register", extractUserRegion, UserController.register);

// Login user
router.post("/login", UserController.login);

router.post("/suggested-username", UserController.getSuggestedUsername);

router.post("/wishlist", authorize(), UserController.addProductToWishlist);

router.post("/follow/:userId", authorize(), UserController.followUser);

router.post("/reset-password/:token", UserController.resetPassword);

router.post("/:userId/reviews", authorize(), UserController.submitReview);

// Update user profile
router.put("/profile", authorize(), UserController.updateProfile);

router.put(
  "/admin/:userId",
  authorize(["Admin"]),
  UserController.updateUserById
);

// Delete user account
router.delete("/profile", authorize(), UserController.deleteAccount);

router.delete(
  "/wishlist/:productId",
  authorize(),
  UserController.removeProductFromWishList
);

router.delete("/unfollow/:userId", authorize(), UserController.unfollowUser);

export default router;

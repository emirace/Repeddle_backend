// userRoutes.ts
import express from 'express';
import UserController from '../controller/user';
import { authorize } from '../middleware/user';

const router = express.Router();

router.post('/send-verification-email', UserController.sendVerificationEmail);

router.post('/send-verification-email', UserController.sendVerificationEmail);

router.post('/forgot-password', UserController.forgotPassword);

router.post('/register', UserController.register);

// Login user
router.post('/login', UserController.login);

// Get user profile
router.get('/profile', authorize(), UserController.getProfile);

// Update user profile
router.put('/profile', authorize(), UserController.updateProfile);

router.post('/follow/:userId', authorize(), UserController.followUser);

router.delete('/unfollow/:userId', authorize(), UserController.unfollowUser);

// Delete user account
router.delete('/profile', authorize(), UserController.deleteAccount);

export default router;

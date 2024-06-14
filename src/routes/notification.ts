import { Router } from "express";
import { authorize } from "../middleware/user";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../controller/notification";

const router = Router();

router.get("/", authorize(), getUserNotifications);

router.put("/:id/mark-read", authorize(), markNotificationAsRead);

export default router;

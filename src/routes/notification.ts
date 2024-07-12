import { Router } from "express";
import { authorize } from "../middleware/user";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../controller/notification";

const router = Router();

router.get("/", authorize(["User", "Admin"]), getUserNotifications);

router.put(
  "/:id/mark-read",
  authorize(["User", "Admin"]),
  markNotificationAsRead
);

export default router;

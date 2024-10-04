// routes/messages.ts

import express from "express";
import {
  forwardMessage,
  getMessages,
  getUserConversations,
  joinConversation,
  replyToMessage,
  sendMessage,
  startConversation,
} from "../controller/message";
import { authorize } from "../middleware/user";

const router = express.Router();

router.get(
  "/conversations/:type",
  authorize(["User", "Admin", "Guest"]),
  getUserConversations
);
router.get(
  "/:conversationId",
  authorize(["User", "Admin", "Guest"]),
  getMessages
);
router.post("/send", authorize(["User", "Admin", "Guest"]), sendMessage);
router.post("/forward", authorize(["User", "Admin", "Guest"]), forwardMessage);
router.post("/reply", authorize(["User", "Admin", "Guest"]), replyToMessage);
router.post(
  "/conversations/start",
  authorize(["User", "Admin", "Guest"]),
  startConversation
);
router.post(
  "/join-conversation/:conversationId",
  authorize(["Admin"]),
  joinConversation
);

// router.post("/conversation", startConversation);

export default router;

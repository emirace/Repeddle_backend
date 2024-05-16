// routes/messages.ts

import express from "express";
import {
  forwardMessage,
  getMessages,
  getUserConversations,
  replyToMessage,
  sendMessage,
  startConversation,
} from "../controller/message";
import { authorize } from "../middleware/user";

const router = express.Router();

router.use(authorize());

router.get("/conversations/:type", getUserConversations);
router.get("/:conversationId", getMessages);
router.post("/send", sendMessage);
router.post("/forward", forwardMessage);
router.post("/reply", replyToMessage);
// router.post("/conversation", startConversation);

export default router;

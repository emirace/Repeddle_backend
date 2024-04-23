// routes/messages.ts

import express from 'express';
import {
  forwardMessage,
  getConversations,
  getMessages,
  replyToMessage,
  sendMessage,
} from '../controller/message';
import { authorize } from '../middleware/user';

const router = express.Router();

router.post('/send', authorize(), sendMessage);
router.get('/conversations', authorize(), getConversations);
router.get('/:receiver', authorize(), getMessages);
router.post('/forward', authorize(), forwardMessage);
router.post('/reply', authorize(), replyToMessage);

export default router;

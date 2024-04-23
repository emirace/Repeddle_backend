import express from 'express';
import {
  fundWallet,
  getUserBalance,
  requestWithdrawal,
} from '../controller/wallet';
import { authorize } from '../middleware/user';

const router = express.Router();

router.post('/fund', authorize(), fundWallet);
router.get('/balance', authorize(), getUserBalance);
router.post('/withdraw', authorize(), requestWithdrawal);

export default router;

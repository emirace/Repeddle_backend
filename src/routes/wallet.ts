import express from "express";
import {
  fundWallet,
  getUserBalance,
  requestWithdrawal,
} from "../controller/wallet";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

router.use(extractUserRegion);

router.post("/fund", authorize(["User", "Admin"]), fundWallet);
router.get("/balance", authorize(["User", "Admin"]), getUserBalance);
router.post("/withdrawal", authorize(["User", "Admin"]), requestWithdrawal);

export default router;

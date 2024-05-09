import express from "express";
import {
  getAllTransactions,
  getUserTransactions,
} from "../controller/transaction";
import { authorize } from "../middleware/user";

const router = express.Router();

router.get("/user", authorize(), getUserTransactions);
router.get("/", authorize(["Admin"]), getAllTransactions);

export default router;

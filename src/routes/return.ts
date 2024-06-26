import express from "express";
import {
  createReturn,
  getReturnById,
  getUserReturns,
  updateReturnStatus,
} from "../controller/return";
import { authorize } from "../middleware/user";

const router = express.Router();

router.get("/user", authorize(), getUserReturns);
router.get("/:id", authorize(), getReturnById);
router.post("/", authorize(), createReturn);
router.put("/:id/status:", authorize(), updateReturnStatus);

export default router;

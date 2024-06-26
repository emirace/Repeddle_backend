import express from "express";
import {
  createReturn,
  getReturnById,
  getUserReturns,
  updateReturnStatus,
  updateUserDeliveryTracking,
} from "../controller/return";
import { authorize } from "../middleware/user";

const router = express.Router();

router.get("/user", authorize(), getUserReturns);
router.get("/:id", authorize(), getReturnById);
router.post("/", authorize(), createReturn);
router.put("/:id/status:", authorize(), updateReturnStatus);
router.put("/:id/delivery-tracking", authorize(), updateUserDeliveryTracking);

export default router;

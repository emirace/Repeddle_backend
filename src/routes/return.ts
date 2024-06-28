import express from "express";
import {
  createReturn,
  getAllReturns,
  getPurchaseReturns,
  getReturnById,
  getSoldReturns,
  updateReturnStatus,
  updateUserDeliveryTracking,
} from "../controller/return";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

router.get("/sold", authorize(), getSoldReturns);
router.get("/purchase", authorize(), getPurchaseReturns);
router.get("/admin", authorize(["Admin"]), getAllReturns);
router.get("/:id", authorize(), getReturnById);
router.post("/", authorize(), extractUserRegion, createReturn);
router.put("/:id/status", authorize(), updateReturnStatus);
router.put("/:id/delivery-tracking", authorize(), updateUserDeliveryTracking);

export default router;

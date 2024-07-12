import express from "express";
import {
  createReturn,
  getAllReturns,
  getPurchaseReturns,
  getReturnById,
  getSoldReturns,
  updateReturnDeliveryAddress,
  updateReturnStatus,
  updateUserDeliveryTracking,
} from "../controller/return";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

router.get("/sold", authorize(["User", "Admin"]), getSoldReturns);
router.get("/purchase", authorize(["User", "Admin"]), getPurchaseReturns);
router.get("/admin", authorize(["Admin"]), getAllReturns);
router.get("/:id", authorize(["User", "Admin"]), getReturnById);
router.post("/", authorize(["User", "Admin"]), extractUserRegion, createReturn);
router.put("/:id/status", authorize(["User", "Admin"]), updateReturnStatus);
router.put(
  "/:id/delivery-tracking",
  authorize(["User", "Admin"]),
  updateUserDeliveryTracking
);
router.put(
  "/:id/address",
  authorize(["User", "Admin"]),
  updateReturnDeliveryAddress
);

export default router;

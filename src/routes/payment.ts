import express from "express";
import {
  approvePayment,
  declinePayment,
  getAllPayments,
  getPaymentById,
  paySeller,
  refundBuyer,
} from "../controller/payment";
import { authorize } from "../middleware/user";

const router = express.Router();

router.get("/", authorize(["Admin"]), getAllPayments);
router.get("/:id", authorize(["Admin"]), getPaymentById);
router.post("/pay-seller/:orderId/:itemId", authorize(["Admin"]), paySeller);
router.post(
  "/refund-buyer/:orderId/:itemId",
  authorize(["Admin"]),
  refundBuyer
);
router.post("/approve/:paymentId", authorize(["Admin"]), approvePayment);
router.post("/decline/:paymentId", authorize(["Admin"]), declinePayment);

export default router;

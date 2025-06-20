import express from "express";
import {
  approvePayment,
  declinePayment,
  getAllPayments,
  getPaymentById,
  initializePaystackPayment,
  paySeller,
  refundBuyer,
} from "../controller/payment";
import { authorize } from "../middleware/user";

const router = express.Router();

router.get("/", authorize(["Admin"]), getAllPayments);
router.get("/:id", authorize(["Admin"]), getPaymentById);
router.post(
  "/:initialize-paystack",
  authorize(["Admin", "User"]),
  initializePaystackPayment
);
router.post("/approve/:paymentId", authorize(["Admin"]), approvePayment);
router.post("/decline/:paymentId", authorize(["Admin"]), declinePayment);
router.post("/pay-seller/:orderId/:itemId", authorize(["Admin"]), paySeller);
router.post(
  "/refund-buyer/:orderId/:itemId",
  authorize(["Admin"]),
  refundBuyer
);

export default router;

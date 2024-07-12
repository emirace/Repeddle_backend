// routes/orderRoutes.ts

import express, { Request, Response } from "express";
import {
  createOrder,
  getOrderById,
  getSellerSoldOrders,
  getUserDailyOrdersSummary,
  getUserOrders,
  updateDeliveryTracking,
} from "../controller/order";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

// Route to make an order
router.post("/", authorize(["User", "Admin"]), extractUserRegion, createOrder);

// Route to update delivery tracking of an item
router.put(
  "/:orderId/items/:itemId/delivery-tracking",
  authorize(["User", "Admin"]),
  updateDeliveryTracking
);

router.get("/", authorize(["User", "Admin"]), getUserOrders);

router.get("/sold", authorize(["User", "Admin"]), getSellerSoldOrders);

router.get("/summary", authorize(["User", "Admin"]), getUserDailyOrdersSummary);

// Route to get an order by ID
router.get("/:orderId", authorize(["User", "Admin"]), getOrderById);

export default router;

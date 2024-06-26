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
router.post("/", authorize(), extractUserRegion, createOrder);

// Route to update delivery tracking of an item
router.put(
  "/:orderId/items/:itemId/delivery-tracking",
  authorize(),
  updateDeliveryTracking
);

router.get("/", authorize(), getUserOrders);

router.get("/sold", authorize(), getSellerSoldOrders);

router.get("/summary", authorize(), getUserDailyOrdersSummary);

// Route to get an order by ID
router.get("/:orderId", authorize(), getOrderById);

export default router;

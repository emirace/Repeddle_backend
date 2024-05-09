// routes/orderRoutes.ts

import express, { Request, Response } from "express";
import {
  createOrder,
  getOrderById,
  getSellerSoldOrders,
  getUserOrders,
  updateDeliveryTracking,
} from "../controller/order";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

// Route to make an order
router.post("/", authorize(), extractUserRegion, createOrder);

// Route to update delivery tracking of an item
router.put(
  "/orders/:orderId/items/:itemId/delivery",
  authorize(),
  updateDeliveryTracking
);

router.get("/", authorize(), getUserOrders);

router.get("/sold", authorize(), getSellerSoldOrders);

// Route to get an order by ID
router.get("/:orderId", authorize(), getOrderById);

export default router;

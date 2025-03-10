// routes/orderRoutes.ts

import express, { Request, Response } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getSellerSoldOrders,
  getUserDailyOrdersSummary,
  getUserOrders,
  toggleHoldItem,
  updateDeliveryTracking,
} from "../controller/order";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

// Route to make an order
router.post("/", authorize(["User", "Admin"]), extractUserRegion, createOrder);

router.put("/hold/:orderId/:itemId", authorize(["Admin"]), toggleHoldItem);

// Route to update delivery tracking of an item
router.put(
  "/:orderId/items/:itemId/delivery-tracking",
  authorize(["User", "Admin"]),
  updateDeliveryTracking
);

router.get("/admin", authorize(["Admin"]), getAllOrders);
router.get("/", authorize(["User", "Admin"]), getUserOrders);

router.get("/sold", authorize(["User", "Admin"]), getSellerSoldOrders);

router.get("/summary", authorize(["User", "Admin"]), getUserDailyOrdersSummary);

// Route to get an order by ID
router.get("/:orderId", authorize(["User", "Admin"]), getOrderById);

export default router;

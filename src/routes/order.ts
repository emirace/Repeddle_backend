// routes/orderRoutes.ts

import express, { Request, Response } from "express";
import {
  createOrder,
  getSellerSoldOrders,
  getUserOrders,
} from "../controller/order";
import { authorize, extractUserRegion } from "../middleware/user";

const router = express.Router();

// Route to make an order
router.post("/", authorize(), extractUserRegion, createOrder);

router.get("/", authorize(), getUserOrders);

router.get("/sold", authorize(), getSellerSoldOrders);

export default router;

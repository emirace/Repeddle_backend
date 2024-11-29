import { Response } from "express";
import Payment from "../model/payment";
import Order from "../model/order";
import { CustomRequest } from "../middleware/user";
import Wallet from "../model/wallet";

// Get all payments
export const getAllPayments = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    // Extract pagination query parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Count total payments for pagination metadata
    const totalPayments = await Payment.countDocuments();

    // Fetch payments with pagination
    const payments = await Payment.find()
      .populate("userId", "username")
      .skip(skip)
      .limit(limit);

    // Response with pagination metadata
    res.status(200).json({
      status: true,
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPayments / limit),
        totalItems: totalPayments,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to fetch payments." });
  }
};

// Get payment by ID
export const getPaymentById = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const payment = await Payment.findById(id).populate(
      "userId",
      "username image"
    );
    if (!payment) {
      res.status(404).json({ status: false, message: "Payment not found." });
      return;
    }
    res.status(200).json(payment);
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to fetch payment." });
  }
};

const COMMISSION_RATE = 0.1; // 10% commission

export const paySeller = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { orderId, itemId } = req.params;
  const { userId } = req.body; // Assuming the user's ID is passed in the request body or fetched from the logged-in user context

  try {
    // Fetch the order and populate the items and seller info
    const order = await Order.findById(orderId).populate(
      "items.seller",
      "username"
    );

    if (!order) {
      res.status(404).json({ status: false, message: "Order not found." });
      return;
    }

    // Find the specific item in the order
    const item = order.items.find((item) => item.product.toString() === itemId);

    if (!item) {
      res.status(404).json({ status: false, message: "Order item not found." });
      return;
    }

    const completeStatuses = ["Received", "Return Declined"]; // Replace with your actual statuses

    // Check if item is marked as complete
    if (
      !completeStatuses.includes(item.deliveryTracking.currentStatus.status)
    ) {
      res
        .status(400)
        .json({ status: false, message: "Item is not completed." });
      return;
    }

    // Verify that the requesting user is the seller of the item
    if ((item.seller as any)._id.toString() !== userId) {
      res.status(403).json({ status: false, message: "Unauthorized seller." });
      return;
    }

    // Calculate the payment amount with commission deducted
    const commission = item.price * COMMISSION_RATE;
    const paymentAmount = item.price - commission;

    // Create a payment record for the seller
    const payment = await Payment.create({
      userId: (item.seller as any)._id,
      amount: paymentAmount,
      status: "Pending",
      reason: `Order Completed`,
      to: "Wallet",
      orderId: orderId,
    });

    res.status(201).json({
      status: true,
      message: "Payment created successfully.",
      payment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to process payment.", error });
  }
};

export const refundBuyer = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { orderId, itemId } = req.params;
  const { userId } = req.body;

  try {
    const order = await Order.findById(orderId).populate("buyer", "username");

    if (!order) {
      res.status(404).json({ status: false, message: "Order not found." });
      return;
    }

    const item = order.items.find((item) => item.product.toString() === itemId);

    if (!item) {
      res.status(404).json({ status: false, message: "Order item not found." });
      return;
    }

    const failedStatuses = ["Return Received"];

    if (!failedStatuses.includes(item.deliveryTracking.currentStatus.status)) {
      res
        .status(400)
        .json({ status: false, message: "Item has not returned." });
      return;
    }

    if ((order.buyer as any)._id.toString() !== userId) {
      res.status(403).json({ status: false, message: "Unauthorized user." });
      return;
    }

    const refund = await Payment.create({
      userId: (order.buyer as any)._id,
      amount: item.price,
      status: "Pending",
      reason: "Order Refunded",
      to: "Wallet",
      orderId: orderId,
    });

    res.status(201).json({
      status: true,
      message: "Refund processed successfully.",
      refund,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to process refund.", error });
  }
};

export const approvePayment = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { paymentId } = req.params;

  try {
    // Fetch the payment record
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      res.status(404).json({ status: false, message: "Payment not found." });
      return;
    }

    if (payment.to === "Wallet") {
      const wallet = await Wallet.findOne({
        userId: payment.userId as unknown as string,
      });

      if (!wallet) {
        res.status(404).json({ status: false, message: "Wallet not found." });
        return;
      }

      wallet.balance += payment.amount;
      await wallet.save();

      payment.status = "Approved";
    } else {
      payment.status = "Approved";
    }
    await payment.save();

    res.status(200).json({
      status: true,
      message: "Payment approved and wallet credited.",
      payment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to approve payment.", error });
  }
};

export const declinePayment = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { paymentId } = req.params;

  try {
    // Fetch the payment record
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      res.status(404).json({ status: false, message: "Payment not found." });
      return;
    }

    // Update the payment status to "Declined"
    payment.status = "Declined";
    await payment.save();

    res.status(200).json({
      status: true,
      message: "Payment declined successfully.",
      payment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to decline payment.", error });
  }
};

import { Response } from "express";
import Payment from "../model/payment";
import Order, { IDeliveryTrackingHistory } from "../model/order";
import { CustomRequest } from "../middleware/user";
import Wallet from "../model/wallet";
import Transaction from "../model/transaction";
import Notification from "../model/notification";
import User from "../model/user";
import { initializePaystack } from "../services/payment";

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
      .sort({ createdAt: -1 })
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
  const { userId } = req.body; // Assuming the user's ID is passed in the request body

  try {
    // Fetch the order and populate item sellers
    const order = await Order.findById(orderId).populate(
      "items.seller",
      "username"
    );

    if (!order) {
      res.status(404).json({ status: false, message: "Order not found." });
      return;
    }

    // Find the item index in the order
    const itemIndex = order.items.findIndex(
      (item) => item.product.toString() === itemId
    );
    if (itemIndex === -1) {
      res.status(404).json({ status: false, message: "Order item not found." });
      return;
    }

    const item = order.items[itemIndex];
    console.log(item);
    // Check if the item has a complete status
    const completeStatuses = ["Received", "Return Declined"]; // Modify as needed
    if (
      !completeStatuses.includes(item.deliveryTracking.currentStatus.status)
    ) {
      res
        .status(400)
        .json({ status: false, message: "Item is not completed." });
      return;
    }

    // Ensure the requesting user is the seller of the item
    if ((item.seller as any)._id.toString() !== userId) {
      res.status(403).json({ status: false, message: "Unauthorized seller." });
      return;
    }

    // Calculate the payment amount after deducting commission
    const commission = item.price * COMMISSION_RATE;
    const paymentAmount = item.price - commission;

    // Create a payment record
    const payment = await Payment.create({
      userId: (item.seller as any)._id,
      amount: paymentAmount,
      status: "Pending",
      reason: "Order Completed",
      to: "Wallet",
      orderId,
    });

    const currentStatus: IDeliveryTrackingHistory = {
      status: item.deliveryTracking.currentStatus.status,
      timestamp: item.deliveryTracking.currentStatus.timestamp,
    };

    // Update delivery tracking history
    item.deliveryTracking.history.push(currentStatus);

    // Update the current status
    item.deliveryTracking.currentStatus = {
      status: "Payment to Seller Initiated",
      timestamp: new Date(),
    };
    console.log(item);
    await order.save();

    res.status(201).json({
      status: true,
      message: "Payment created successfully.",
      payment,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      status: false,
      message: "Failed to process payment.",
      error: error instanceof Error ? error.message : error,
    });
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

      const transaction = new Transaction({
        type: "credit",
        userId: wallet.userId,
        walletId: wallet._id,
        amount: payment.amount,
        status: "COMPLETED",
        description: "Order completed",
        currency: wallet.currency,
      });
      await transaction.save();
      await Notification.create({
        message: `Payment Approved`,
        link: `/transaction/${transaction._id}`,
        user: wallet.userId,
        image: "",
        mobileLink: {
          name: `TransactionDetail`,
          params: transaction,
        },
      });
    } else {
      payment.status = "Approved";
      await Notification.create({
        message: `Withdrawal Approved`,
        link: `/transaction/${payment.orderId}`,
        user: payment.userId,
        image: "",
        mobileLink: {
          name: `TransactionDetail`,
          params: payment.orderId,
        },
      });
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

export const initializePaystackPayment = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  const { amount } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ status: false, message: "User not found." });
      return;
    }

    const data = await initializePaystack(user.email, amount);

    res.status(200).json({
      status: true,
      message: "Payment initialize successfully.",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to initialize payment.", error });
  }
};

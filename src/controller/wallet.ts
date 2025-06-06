// Import necessary modules and models
import { Request, Response } from "express";
import Wallet from "../model/wallet";
import Transaction from "../model/transaction";
import { CustomRequest } from "../middleware/user";
import mongoose from "mongoose";
import Order from "../model/order";
import { verifyPayment } from "../services/payment";
import { performDeposit } from "../utils/wallet";

// Controller to fund wallet with Flutterwave
export async function fundWallet(req: CustomRequest, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.userId!;
    const currency = req.userRegion!;

    const { amount, transactionId, paymentProvider } = req.body;

    const existOrder = await Order.find({ transactionId }).session(session);

    const existTransaction = await Transaction.findOne({
      paymentTransactionId: transactionId,
    });
    console.log(
      "existTransaction",
      transactionId,
      paymentProvider,
      existTransaction,
      existOrder
    );
    // if (existOrder.length > 0 || existTransaction) {
    //   await session.abortTransaction();
    //   session.endSession();
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "Possible dublicate transaction" });
    // }

    const paymentVerification = await verifyPayment(
      paymentProvider,
      transactionId.toString()
    );

    if (
      !paymentVerification.status ||
      !paymentVerification.amount ||
      !paymentVerification.currency
    ) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ status: false, message: "Payment verification failed" });
    }

    if (
      amount !== paymentVerification.amount ||
      currency !== paymentVerification.currency
    ) {
      await session.abortTransaction();
      session.endSession();

      const errorMessage =
        amount !== paymentVerification.amount
          ? "Invalid transaction amount"
          : "Invalid transaction currency";

      return res.status(400).json({ status: false, message: errorMessage });
    }

    const deposit = await performDeposit({
      userId,
      currency,
      amount,
      paymentTransactionId: transactionId,
      session,
    });
    if (!deposit.status) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: false,
        message: deposit.message,
      });
    }

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ status: true, message: "Wallet funded successfully" });
  } catch (error) {
    console.error("Error funding wallet:", error);
    res
      .status(500)
      .json({ status: false, message: "Error funding wallet", error });
  }
}

// Controller to get user balance
export async function getUserBalance(req: CustomRequest, res: Response) {
  try {
    const { userId } = req;
    const currency = req.userRegion;
    var wallet;
    wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = await Wallet.create({ userId, currency });
    }

    res.status(200).json({
      status: true,
      balance: wallet.balance,
      currency: wallet.currency,
    });
  } catch (error) {
    console.error("Error getting user balance:", error);
    res
      .status(500)
      .json({ status: false, message: "Error getting user balance", error });
  }
}

// Controller to process withdrawal request
export async function requestWithdrawal(req: CustomRequest, res: Response) {
  try {
    // Implement the logic to process withdrawal request
    // This may involve initiating a withdrawal transaction and updating the wallet balance
    // Example:
    const userId = req.userId;
    const { amount } = req.body;

    // Check if the user has sufficient balance
    const wallet = await Wallet.findOne({ userId });

    if (!wallet || wallet.balance < amount) {
      return res
        .status(400)
        .json({ status: false, message: "Insufficient balance" });
    }

    // Deduct amount from wallet balance
    wallet.balance -= amount;
    await wallet.save();

    // Create transaction record for withdrawal
    const transaction = new Transaction({
      type: "debit",
      userId,
      walletId: wallet._id,
      amount,
      status: "PENDING",
      description: "Redrawal request",
    });
    await transaction.save();

    res.status(200).json({
      status: true,
      message: "Withdrawal request processed successfully",
    });
  } catch (error) {
    console.error("Error processing withdrawal request:", error);
    res.status(500).json({
      status: false,
      message: "Error processing withdrawal request",
      error,
    });
  }
}

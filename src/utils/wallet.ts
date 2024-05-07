import mongoose from "mongoose";
import Transaction from "../model/transaction";
import Wallet, { IWallet } from "../model/wallet";

export const performWithdrawal = async (data: {
  userId: string;
  currency: string;
  amount: number;
  session: mongoose.ClientSession | null;
  status?: string;
}): Promise<{ status: boolean; message?: string }> => {
  const { userId, amount, currency, session, status = "PENDING" } = data;
  try {
    // Find the wallet for the specified currency
    const wallet = await Wallet.findOne({ userId }).session(session);

    if (!wallet || wallet.balance < amount) {
      return { status: false, message: "Insufficient funds" };
    }

    // Update wallet balance
    wallet.balance -= amount;
    await wallet.save({ session });

    // Record the transaction
    const transaction = new Transaction({
      type: "debit",
      userId,
      walletId: wallet._id,
      amount,
      status,
      description: "Withdraw from wallet",
      currency,
    });
    await transaction.save({ session });

    return { status: true };
  } catch (error) {
    console.error("Error in performWithdrawal:", error);
    return { status: false, message: "Error in performWithdrawal" };
  }
};

export const performDeposit = async (data: {
  userId: string;
  currency: string;
  amount: number;
  paymentTransactionId: string;
  session: mongoose.ClientSession | null;
}): Promise<{ status: boolean; message?: string }> => {
  try {
    const { amount, currency, paymentTransactionId, session, userId } = data;
    // Find or create a wallet for the specified currency
    var wallet;
    wallet = await Wallet.findOne({
      userId,
      currency,
    }).session(session);

    if (!wallet) {
      wallet = new Wallet({
        userId,
        currency,
      });
      wallet.save({ session });
    }

    // Update wallet balance
    wallet.balance += amount;
    await wallet.save({ session });

    // Record the transaction
    const transaction = new Transaction({
      type: "credit",
      userId,
      walletId: wallet._id,
      amount,
      status: "COMPLETED",
      description: "Fund wallet",
      currency,
      paymentTransactionId,
    });
    await transaction.save({ session });

    return { status: true };
  } catch (error) {
    console.error("Error in performDeposit:", error);
    return { status: false, message: "Error in performDeposit" };
  }
};

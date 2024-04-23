// Import necessary modules and models
import { Request, Response } from 'express';
import Wallet from '../model/wallet';
import Transaction from '../model/transaction';
import { CustomRequest } from '../middleware/user';

// Controller to fund wallet with Flutterwave
export async function fundWallet(req: Request, res: Response) {
  try {
    // Implement the logic to process funding with Flutterwave
    // This may involve interacting with Flutterwave APIs to initiate a payment
    // Once the payment is successful, update the user's wallet balance and create a transaction record
    // Example:
    const { userId, amount } = req.body;

    // Update wallet balance
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true }
    );
    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, message: 'Wallet not found' });
    }
    // Create transaction record
    await Transaction.create({ walletId: wallet._id, amount, type: 'credit' });

    res
      .status(200)
      .json({ success: true, message: 'Wallet funded successfully', wallet });
  } catch (error) {
    console.error('Error funding wallet:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error funding wallet', error });
  }
}

// Controller to get user balance
export async function getUserBalance(req: CustomRequest, res: Response) {
  try {
    const { userId } = req;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, message: 'Wallet not found' });
    }

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      currency: wallet.currency,
    });
  } catch (error) {
    console.error('Error getting user balance:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error getting user balance', error });
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
        .json({ success: false, message: 'Insufficient balance' });
    }

    // Deduct amount from wallet balance
    wallet.balance -= amount;
    await wallet.save();

    // Create transaction record for withdrawal
    await Transaction.create({ walletId: wallet._id, amount, type: 'debit' });

    res.status(200).json({
      success: true,
      message: 'Withdrawal request processed successfully',
    });
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing withdrawal request',
      error,
    });
  }
}

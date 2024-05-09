import { Request, Response } from "express";
import Transaction, { ITransaction } from "../model/transaction";
import { CustomRequest } from "../middleware/user";

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    // Find all transactions
    const transactions: ITransaction[] = await Transaction.find();

    res.status(200).json({ status: true, transactions });
  } catch (error) {
    console.log("Error fetching all transactions", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getUserTransactions = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { userId } = req;

    // Find transactions for the specified user
    const transactions: ITransaction[] = await Transaction.find({ userId });

    res.status(200).json({ status: true, transactions });
  } catch (error) {
    console.log("Error fetching user transactions", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

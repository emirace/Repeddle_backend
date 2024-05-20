import { Request, Response } from "express";
import Transaction, { ITransaction } from "../model/transaction";
import { CustomRequest } from "../middleware/user";

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    // Extract transactionId query parameter if exists
    const transactionId = req.query.transactionId;

    // Define the aggregation pipeline stages
    const pipeline: any[] = [];

    if (transactionId) {
      pipeline.push(
        {
          $addFields: {
            tempTransactionId: { $toString: "$_id" }, // Convert _id to string
          },
        },
        {
          $match: {
            tempTransactionId: { $regex: transactionId, $options: "i" }, // Case-insensitive regex match
          },
        }
      );
    }
    // Find all transactions
    const transactions: ITransaction[] = await Transaction.aggregate(pipeline);

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

    // Extract transactionId query parameter if exists
    const transactionId = req.query.transactionId;

    // Define the aggregation pipeline stages
    const pipeline: any[] = [
      {
        $match: {
          userId,
        },
      },
    ];

    if (transactionId) {
      pipeline.push(
        {
          $addFields: {
            tempTransactionId: { $toString: "$_id" }, // Convert _id to string
          },
        },
        {
          $match: {
            tempTransactionId: { $regex: transactionId, $options: "i" }, // Case-insensitive regex match
          },
        }
      );
    }

    // Find transactions for the specified user
    const transactions: ITransaction[] = await Transaction.aggregate(pipeline);

    res.status(200).json({ status: true, transactions });
  } catch (error) {
    console.log("Error fetching user transactions", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the transaction by ID
    const transaction: ITransaction | null = await Transaction.findById(id);

    if (!transaction) {
      return res
        .status(404)
        .json({ status: false, message: "Transaction not found" });
    }

    // If the transaction is found, return it
    res.status(200).json({ status: true, transaction });
  } catch (error) {
    console.log("Error fetching transaction by ID", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

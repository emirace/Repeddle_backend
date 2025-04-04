import { Request, Response } from "express";
import Transaction, { ITransaction } from "../model/transaction";
import { CustomRequest } from "../middleware/user";
import mongoose from "mongoose";

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    const transactionId = req.query.transactionId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

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

    // Add pagination stages
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Find all transactions with pagination
    const transactions: ITransaction[] = await Transaction.aggregate(pipeline);

    // Count total documents for pagination metadata
    const totalDocsPipeline = [...pipeline];
    totalDocsPipeline.pop(); // Remove $limit
    totalDocsPipeline.pop(); // Remove $skip
    totalDocsPipeline.push({ $count: "total" });
    const totalDocsResult = await Transaction.aggregate(totalDocsPipeline);
    const totalDocs = totalDocsResult.length > 0 ? totalDocsResult[0].total : 0;

    // Send response
    res.status(200).json({
      status: true,
      transactions,
      pagination: {
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit),
        currentPage: page,
        pageSize: transactions.length,
      },
    });
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

    // Extract query parameters
    const transactionId = req.query.transactionId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Define the aggregation pipeline stages
    const pipeline: any[] = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
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

    // Add pagination stages
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Find transactions for the specified user with pagination
    const transactions: ITransaction[] = await Transaction.aggregate(pipeline);
    console.log("userTransactions", transactions, userId);

    // Count total documents for pagination metadata
    const totalDocsPipeline = [...pipeline];
    totalDocsPipeline.pop(); // Remove $limit
    totalDocsPipeline.pop(); // Remove $skip
    totalDocsPipeline.push({ $count: "total" });
    const totalDocsResult = await Transaction.aggregate(totalDocsPipeline);
    const totalDocs = totalDocsResult.length > 0 ? totalDocsResult[0].total : 0;

    // Send response
    res.status(200).json({
      status: true,
      transactions,
      pagination: {
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit),
        currentPage: page,
        pageSize: transactions.length,
      },
    });
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

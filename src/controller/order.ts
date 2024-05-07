import { Response } from "express";
import Product, { IProduct } from "../model/product";
import Order, { IOrder } from "../model/order";
import { CustomRequest } from "../middleware/user";
import { verifyPayment } from "../services/payment";
import mongoose from "mongoose";
import { performWithdrawal } from "../utils/wallet";
import User from "../model/user";
import { body, validationResult } from "express-validator";
import Transaction from "../model/transaction";

export const createOrder = async (req: CustomRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Promise.all([
      body("items").isArray().withMessage("Items must be an array"),
      body("items.*._id").exists().withMessage("Product ID is required"),
      body("items.*.quantity")
        .exists()
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer"),
      body("items.*.selectedSize")
        .optional()
        .isString()
        .withMessage("Selected size must be a string"),
      body("items.*.selectedColor")
        .optional()
        .isString()
        .withMessage("Selected color must be a string"),
      body("items.*.deliveryOption")
        .exists()
        .withMessage("Delivery option is required"),
      body("totalAmount")
        .exists()
        .isNumeric()
        .withMessage("Total amount must be a number"),
      body("paymentMethod")
        .exists()
        .isString()
        .withMessage("Payment method is required"),
      body("transactionId")
        .optional()
        .isString()
        .withMessage("Transaction ID must be a string"),
    ]);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    const userId = req.userId!;
    const currency = req.userRegion!;
    const { items, totalAmount, paymentMethod, transactionId } = req.body;

    let totalPrice = 0;

    const fetchedItems = await Promise.all(
      items.map(async (item: any) => {
        const product: IProduct | null = await Product.findById(item._id);

        if (!product) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            status: false,
            message: `Product not found for ID: ${item._d}`,
          });
        }

        const selectedSizeIndex = product.sizes.findIndex(
          (size) => size.size === item.selectedSize
        );
        if (
          selectedSizeIndex === -1 ||
          product.sizes[selectedSizeIndex].quantity < item.quantity
        ) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            status: false,
            message: `Not enough stock available for product: ${product.name}, size: ${item.selectedSize}`,
          });
        }

        // Reduce the quantity of the selected size
        const updatedSizes = [...product.sizes];
        updatedSizes[selectedSizeIndex].quantity -= item.quantity;

        // Update countInStock and product sizes in database
        await Product.findByIdAndUpdate(
          item._id,
          { sizes: updatedSizes, $addToSet: { sold: userId } },
          { session }
        );

        // Update seller user model
        const sellerId = product.seller; // Assuming 'seller' field holds the ObjectId of the seller
        await User.findByIdAndUpdate(
          sellerId,
          { $addToSet: { sold: product._id } },
          { session }
        );

        // Calculate item price based on product selling price and quantity
        const price = product.sellingPrice * item.quantity;
        totalPrice += price;

        const defaultDeliveryTracking = {
          currentStatus: { status: "Processing", timestamp: new Date() },
          history: [{ status: "Processing", timestamp: new Date() }],
        };

        return {
          product: product._id,
          selectedColor: item.selectedColor,
          seller: product.seller,
          price,
          quantity: item.quantity,
          deliveryOption: item.deliveryOption,
          deliveryTracking: defaultDeliveryTracking,
        };
      })
    );

    if (paymentMethod === "PayFast" || paymentMethod === "Flutterwave") {
      const paymentVerified = await verifyPayment(paymentMethod, transactionId);

      if (
        !paymentVerified.status ||
        !paymentVerified.amount ||
        !paymentVerified.currency
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: false,
          message: "Payment verification failed",
        });
      }

      if (
        totalAmount !== paymentVerified.amount &&
        totalPrice > paymentVerified.amount
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: false,
          message: "Invalid payment amount",
        });
      }

      const existOrder = await Order.find({ transactionId }).session(session);

      const existTransaction = await Transaction.findOne({
        paymentTransactionId: transactionId,
      });
      if (existOrder.length > 0 || existTransaction) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: false,
          message: "Possible duplicate transaction",
        });
      }
    } else if (paymentMethod === "Wallet") {
      if (totalPrice > totalAmount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: false,
          message: "Invalid payment amount",
        });
      }

      const withdraw = await performWithdrawal({
        userId,
        currency,
        amount: totalAmount,
        session,
        status: "COMPLETED",
      });
      if (!withdraw.status) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
          status: false,
          message: withdraw.message,
        });
      }
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        status: false,
        message: "Invalid payment method",
      });
    }

    const order: IOrder = await Order.create({
      buyer: userId,
      items: fetchedItems,
      totalAmount,
      paymentMethod,
      transactionId,
    });

    // add rebundle feature later

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json({ status: true, message: "Order created successfully", order });
  } catch (error: any) {
    console.error("Error creating order:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

export const getUserOrders = async (req: CustomRequest, res: Response) => {
  try {
    // Extract user ID from request
    const userId = req.userId!;

    // Fetch orders for the user
    const orders = await Order.find({ buyer: userId });

    // Return the orders
    return res.status(200).json({ status: true, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// Controller to get seller's sold orders
export const getSellerSoldOrders = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    // Extract seller ID from request
    const sellerId = req.userId!;

    // Fetch sold orders for the seller where any item in the order belongs to the seller
    const soldOrders = await Order.find({ "items.seller": sellerId });

    // Filter and return only the products belonging to the seller from each order
    const sellerSoldOrders = soldOrders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => String(item.seller) === String(sellerId)
      );
      return { ...order.toObject(), items: sellerItems };
    });

    // Return the sold orders with filtered products belonging to the seller
    return res.status(200).json({ status: true, orders: sellerSoldOrders });
  } catch (error) {
    console.error("Error fetching seller sold orders:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

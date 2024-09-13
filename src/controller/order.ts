import { Response } from "express";
import Product, { IProduct } from "../model/product";
import Order, { IDeliveryTrackingHistory, IOrder } from "../model/order";
import { CustomRequest } from "../middleware/user";
import { verifyPayment } from "../services/payment";
import mongoose, { Types } from "mongoose";
import { performWithdrawal } from "../utils/wallet";
import User from "../model/user";
import { body, validationResult } from "express-validator";
import Transaction from "../model/transaction";
import { isUserSeller } from "../utils/order";
import Notification from "../model/notification";

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

        if (product.seller.toString() === userId) {
          return res.status(400).json({
            status: false,
            message: `You can not purchase your item`,
          });
        }

        const updatedSizes = [...product.sizes];

        if (item.selectedSize) {
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
          updatedSizes[selectedSizeIndex].quantity -= item.quantity;
        } else {
          if (product.countInStock < item.quantity) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              status: false,
              message: `Not enough stock available for product: ${product.name}`,
            });
          }
        }

        // Update countInStock and product sizes in database
        const countInStock = product.countInStock - item.quantity;

        await Product.findByIdAndUpdate(
          item._id,
          {
            sizes: updatedSizes,
            countInStock,
            $addToSet: { buyers: userId },
          },
          { session }
        );

        // Update seller user model
        const sellerId = product.seller; // Assuming 'seller' field holds the ObjectId of the seller
        await User.findByIdAndUpdate(
          sellerId,
          {
            $addToSet: { sold: product._id, buyers: userId },
          },
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
          deliveryOption: {
            method: item.deliverySelect["delivery Option"],
            fee: item.deliverySelect.total.cost,
          },
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
    const userId = req.userId!;
    const orderId = req.query.orderId as string | undefined;

    // Define the aggregation pipeline stages
    const pipeline: any[] = [
      {
        $match: {
          buyer: new mongoose.Types.ObjectId(userId),
        },
      },
    ];

    // If orderId query parameter exists, add $match stage to filter by orderId
    if (orderId) {
      pipeline.push(
        {
          $addFields: {
            tempOrderId: { $toString: "$_id" }, // Convert _id to string
          },
        },
        {
          $match: {
            tempOrderId: { $regex: new RegExp(orderId, "i") }, // Case-insensitive regex match
          },
        }
      );
    }

    // Add the $sort stage to sort by createdAt in descending order
    pipeline.push({
      $sort: { createdAt: -1 },
    });

    // Execute the aggregation pipeline
    const orders = await Order.aggregate(pipeline).exec();

    // Populate the product fields in the items
    const populatedOrders = await Order.populate(orders, {
      path: "items.product",
      select: "images name",
    });

    // Return the orders
    return res.status(200).json({ status: true, orders: populatedOrders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

export const getSellerSoldOrders = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    // Extract seller ID from request
    const sellerId = req.userId!;

    // Extract orderId query parameter if exists
    const orderId = req.query.orderId;

    // Define the aggregation pipeline stages
    const pipeline: any[] = [
      {
        $match: {
          "items.seller": new mongoose.Types.ObjectId(sellerId),
        },
      },
    ];

    // If orderId query parameter exists, add $match stage to filter by orderId
    if (orderId) {
      pipeline.push(
        {
          $addFields: {
            tempOrderId: { $toString: "$_id" }, // Convert _id to string
          },
        },
        {
          $match: {
            tempOrderId: { $regex: orderId, $options: "i" }, // Case-insensitive regex match
          },
        }
      );
    }

    // Add the $sort stage to sort by createdAt in descending order
    pipeline.push({
      $sort: { createdAt: -1 },
    });

    // Execute the aggregation pipeline
    let soldOrders: IOrder[] = await Order.aggregate(pipeline);

    soldOrders = await Order.populate(soldOrders, {
      path: "items.product",
      select: "images name",
    });

    // Filter and return only the products belonging to the seller from each order
    const sellerSoldOrders = soldOrders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => String(item.seller) === String(sellerId)
      );

      const totalAmount = sellerItems.reduce((acc, item) => {
        return (
          acc + item.price + (item.deliveryOption ? item.deliveryOption.fee : 0)
        );
      }, 0);

      return { ...order, items: sellerItems, totalAmount };
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

export const getOrderById = async (req: CustomRequest, res: Response) => {
  try {
    // Extract order ID from request parameters
    const orderId = req.params.orderId;

    // Fetch the order by ID
    const order: any = await Order.findById(orderId)
      .populate("items.seller", "username image firstName lastName")
      .populate("buyer", "username image firstName lastName")
      .populate("items.product");

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the user is authorized to access the order
    const { isAdmin } = req;
    const userId = req.userId!;
    if (
      !isAdmin &&
      order.buyer._id.toString() !== userId &&
      !isUserSeller(order, userId)
    ) {
      return res.status(401).json({
        status: false,
        message: "Not authorized to access this order",
      });
    }

    // If the user is a seller, filter the items to include only those where the user is the seller
    if (isUserSeller(order, userId)) {
      order.items = order.items.filter(
        (item: any) => item.seller._id.toString() === userId
      );
    }

    // Return the order
    return res.status(200).json({ status: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// Controller to update delivery tracking of an item in an order
export const updateDeliveryTracking = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    // Extract order ID, item ID, and user ID from request parameters
    const orderId = req.params.orderId;
    const itemId = req.params.itemId;
    const userId = req.userId; // Assuming userId is included in the request

    // Extract new delivery tracking details from request body
    const { status, trackingNumber } = req.body;

    // Fetch the order by ID
    const order: any = await Order.findById(orderId)
      .populate("items.seller", "username image firstName lastName")
      .populate("buyer", "username image firstName lastName")
      .populate("items.product");

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the item in the order by ID
    const itemIndex = order.items.findIndex(
      (item: any) => item.product._id.toString() === itemId
    );

    // Check if the item exists in the order
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    // Fetch the product associated with the item
    const product: any = await Product.findById(
      order.items[itemIndex].product._id
    );

    // Check if the product exists
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    const isSeller = product.seller._id.toString() === userId?.toString();
    const isBuyer = order.buyer._id.toString() === userId?.toString();

    // Ensure that only the seller can update the status from "Processing" to "Delivered"
    if (!isSeller && !isBuyer) {
      return res.status(403).json({
        message:
          "Unauthorized: Only the seller or buyer can update delivery tracking",
      });
    }

    // Ensure that only the seller can update the status other than "Received"
    if (status !== "Received" && !isSeller) {
      return res.status(403).json({
        message: "Unauthorized: Only the seller can update the status",
      });
    }

    // Ensure that only the buyer can update the status to "Received"
    if (status === "Received" && !isBuyer) {
      return res.status(403).json({
        message:
          "Unauthorized: Only the buyer can update the status to Received",
      });
    }

    // Check if the new status is different from current status and history
    const allStatuses = [
      order.items[itemIndex].deliveryTracking.currentStatus.status,
      ...order.items[itemIndex].deliveryTracking.history.map(
        (entry: { status: any }) => entry.status
      ),
    ];
    if (allStatuses.includes(status)) {
      return res
        .status(400)
        .json({ status: false, message: "Cannot update to a previous status" });
    }

    // Get the current delivery tracking status of the item
    const currentStatus: IDeliveryTrackingHistory = {
      status: order.items[itemIndex].deliveryTracking.currentStatus.status,
      timestamp:
        order.items[itemIndex].deliveryTracking.currentStatus.timestamp,
    };

    // Add the current status to the delivery tracking history
    order.items[itemIndex].deliveryTracking.history.push(currentStatus);

    // Update the delivery tracking of the item
    order.items[itemIndex].deliveryTracking.currentStatus = {
      status: status,
      timestamp: new Date(),
    };

    if (trackingNumber) {
      order.items[itemIndex].trackingNumber = trackingNumber;
    }

    // Save the updated order
    await order.save();

    await Notification.create({
      message: `Order ${status}`,
      link: `/order/${order._id}`,
      user: order.buyer._id,
    });

    // Return success response
    return res.status(200).json({
      status: true,
      message: "Delivery tracking updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating delivery tracking:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

export const getUserDailyOrdersSummary = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const userId = req.userId; // Assuming userId is extracted from the request
    let { startDate, endDate } = req.query; // Assuming startDate and endDate are provided in the query parameters

    // Set default values for startDate and endDate if not provided
    if (!startDate || !endDate) {
      const today = new Date();
      startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).toISOString();
      endDate = today.toISOString();
    }

    // Parse start and end date strings to Date objects
    const parsedStartDate = new Date(startDate as string);
    const parsedEndDate = new Date(endDate as string);

    // Aggregate purchased orders based on the day of creation within the specified time frame
    const dailyPurchasedOrders = await Order.aggregate([
      {
        $match: {
          buyer: userId,
          createdAt: { $gte: parsedStartDate, $lte: parsedEndDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          sales: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Aggregate sold orders based on the day of creation within the specified time frame
    const dailySoldOrders = await Order.aggregate([
      {
        $match: {
          "items.seller": userId,
          createdAt: { $gte: parsedStartDate, $lte: parsedEndDate },
        },
      },
      {
        $addFields: {
          // Filter items to include only those where the seller matches userId
          filteredItems: {
            $filter: {
              input: "$items",
              as: "item",
              cond: { $eq: ["$$item.seller", userId] },
            },
          },
        },
      },
      {
        $addFields: {
          // Compute the total sales for each filtered item
          filteredItems: {
            $map: {
              input: "$filteredItems",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    totalSales: {
                      $sum: ["$$item.price", "$$item.deliveryOption.fee"],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          sales: { $sum: { $sum: "$filteredItems.totalSales" } },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const purchaseOrders = dailyPurchasedOrders.reduce(
      (acc, { orders, sales }) => {
        acc.numOrders += orders;
        acc.numSales += sales;
        return acc;
      },
      { numOrders: 0, numSales: 0 }
    );

    const soldOrders = dailySoldOrders.reduce(
      (acc, { orders, sales }) => {
        acc.numOrders += orders;
        acc.numSales += sales;
        return acc;
      },
      { numOrders: 0, numSales: 0 }
    );

    res.status(200).json({
      status: true,
      data: {
        purchaseOrders,
        soldOrders,
        dailyPurchasedOrders,
        dailySoldOrders,
      },
    });
  } catch (error) {
    console.log("Error fetching user daily orders summary", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

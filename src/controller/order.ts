import { Request, Response } from "express";
import Product, { IProduct } from "../model/product";
import Order, { IDeliveryTrackingHistory, IOrder } from "../model/order";
import { CustomRequest } from "../middleware/user";
import { verifyPayment } from "../services/payment";
import mongoose from "mongoose";
import { getCurrencyByCountryCode, performWithdrawal } from "../utils/wallet";
import User from "../model/user";
import { body, validationResult } from "express-validator";
import Transaction from "../model/transaction";
import { isUserSeller } from "../utils/order";
import Notification from "../model/notification";
import { io } from "../app";
import { createNotification } from "../utils/notification";

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
    const currency = getCurrencyByCountryCode(req.userRegion!);
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

        // const io = req.app.get("io");
        createNotification(sellerId.toString(), "order", io);

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

    if (["PayFast", "Flutterwave", "Paystack"].includes(paymentMethod)) {
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

      console.log("verification successfull");

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

      console.log("amount verification successfull");

      console.log("finisihed payment and order check");
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

    console.log("all payment verification successfull");

    const order: any = new Order({
      buyer: userId,
      items: fetchedItems,
      totalAmount,
      paymentMethod,
      transactionId,
    });

    await order.save();

    await order.populate([
      { path: "items.product", select: "images name" },
      {
        path: "items.seller",
        select: "username image firstName lastName socketId",
      },
    ]);

    console.log("populated order", order);

    for (const item of order.items) {
      const notification = await Notification.create({
        message: `Order created`,
        link: `/order/${order._id}`,
        user: item.seller._id,
        image: item.product.images[0],
        mobileLink: {
          name: `OrderDetails`,
          params: { id: order._id.toString() },
        },
      });

      if (item.seller.socketId) {
        io.to(item.seller.socketId).emit("newNotification", notification);
        createNotification(item.seller._id, "order", io);
      }
    }

    // add rebundle feature later

    await session.commitTransaction();
    session.endSession();
    console.log("transaction closed successfull");

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

export const getAllOrders = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const orderId = req.query.orderId as string | undefined;
    const page = parseInt(req.query.page as string, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    const pipeline: any[] = [];

    if (orderId) {
      pipeline.push(
        {
          $addFields: {
            tempOrderId: { $toString: "$_id" },
          },
        },
        {
          $match: {
            tempOrderId: { $regex: new RegExp(orderId, "i") },
          },
        }
      );
    }

    pipeline.push(
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      }
    );

    // Execute the aggregation pipeline
    const orders = await Order.aggregate(pipeline).exec();

    // Populate the product fields in the items
    const populatedOrders = await Order.populate(orders, {
      path: "items.product",
      select: "images name",
    });

    // Get total count of orders for pagination info
    const totalOrdersPipeline = [...pipeline];
    totalOrdersPipeline.splice(totalOrdersPipeline.length - 2, 2); // Remove `$skip` and `$limit`
    const totalOrders = await Order.aggregate(totalOrdersPipeline)
      .count("total")
      .exec();
    const totalCount = totalOrders[0]?.total || 0;

    res.status(200).json({
      status: true,
      orders: populatedOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to fetch orders." });
  }
};

export const getUserOrders = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const orderId = req.query.orderId as string | undefined;
    const page = parseInt(req.query.page as string, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      {
        $match: {
          buyer: new mongoose.Types.ObjectId(userId),
        },
      },
    ];

    if (orderId) {
      pipeline.push(
        {
          $addFields: {
            tempOrderId: { $toString: "$_id" },
          },
        },
        {
          $match: {
            tempOrderId: { $regex: new RegExp(orderId, "i") },
          },
        }
      );
    }

    pipeline.push(
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      }
    );

    // Execute the aggregation pipeline
    const orders = await Order.aggregate(pipeline).exec();

    // Populate the product fields in the items
    const populatedOrders = await Order.populate(orders, {
      path: "items.product",
      select: "images name",
    });

    // Get total count of user's orders for pagination info
    const totalOrdersPipeline = [...pipeline];
    totalOrdersPipeline.splice(totalOrdersPipeline.length - 2, 2); // Remove `$skip` and `$limit`
    const totalOrders = await Order.aggregate(totalOrdersPipeline)
      .count("total")
      .exec();
    const totalCount = totalOrders[0]?.total || 0;

    return res.status(200).json({
      status: true,
      orders: populatedOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
      },
    });
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

    // Extract query parameters
    const orderId = req.query.orderId as string | undefined;
    const page = parseInt(req.query.page as string, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

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

    // Add $sort, $skip, and $limit stages for pagination
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // Execute the aggregation pipeline
    let soldOrders: IOrder[] = await Order.aggregate(pipeline);

    // Populate product details in the items
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

    // Get total count of seller's sold orders for pagination
    const totalOrdersPipeline = [...pipeline];
    totalOrdersPipeline.splice(totalOrdersPipeline.length - 3, 3); // Remove $skip, $limit, and $sort
    const totalOrders = await Order.aggregate(totalOrdersPipeline)
      .count("total")
      .exec();
    const totalCount = totalOrders[0]?.total || 0;

    // Return the sold orders with pagination metadata
    return res.status(200).json({
      status: true,
      orders: sellerSoldOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
      },
    });
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
      .populate("items.seller", "username image firstName lastName socketId")
      .populate("buyer", "username image firstName lastName socketId")
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
    if (status !== "Received") {
      const notification = await Notification.create({
        message: `Order ${status}`,
        link: `/order/${order._id}`,
        user: order.buyer._id,
        image: product.images[0],
        mobileLink: {
          name: `OrderDetails`,
          params: { id: order._id.toString() },
        },
      });

      if (order.buyer?.socketId) {
        io.to(order.buyer?.socketId).emit("newNotification", notification);
        createNotification(order.buyer._id, "order", io);
      }
    } else {
      const seller = order.items[itemIndex].seller;

      const notification = await Notification.create({
        message: `Order ${status}`,
        link: `/order/${order._id}`,
        user: seller._id,
        image: product.images[0],
        mobileLink: {
          name: `OrderDetails`,
          params: { id: order._id.toString() },
        },
      });

      if (seller?.socketId) {
        io.to(seller?.socketId).emit("newNotification", notification);
        createNotification(seller._id, "order", io);
      }
    }
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

    console.log(parsedStartDate, parsedEndDate);

    // Aggregate purchased orders based on the day of creation within the specified time frame
    const dailyPurchasedOrders = await Order.aggregate([
      {
        $match: {
          buyer: new mongoose.Types.ObjectId(userId),
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
          "items.seller": new mongoose.Types.ObjectId(userId),
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

export const toggleHoldItem = async (req: Request, res: Response) => {
  const { orderId, itemId } = req.params;
  const { action } = req.query; // "hold" or "unhold"

  try {
    // Find the order and the specific item

    const order: any = await Order.findById(orderId)
      .populate("items.seller", "username image firstName lastName")
      .populate("buyer", "username image firstName lastName")
      .populate("items.product");

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const item = order.items.id(itemId);
    if (!item) {
      res.status(404).json({ message: "Item not found in the order" });
      return;
    }

    // Determine the action
    if (action === "hold") {
      item.isHold = true;
      item.deliveryTracking.history.push({
        status: "Hold",
        timestamp: new Date(),
      });
    } else if (action === "unhold") {
      item.isHold = false;
      item.deliveryTracking.history.push({
        status: "UnHold",
        timestamp: new Date(),
      });
    } else {
      res.status(400).json({ message: "Invalid action specified" });
      return;
    }

    await order.save();
    res.status(200).json({
      message: `Item successfully ${
        action === "hold" ? "placed on hold" : "unheld"
      }`,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating hold status", error });
  }
};

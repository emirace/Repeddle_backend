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
          { sizes: updatedSizes, $addToSet: { buyers: userId } },
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

    // Extract orderId query parameter if exists
    const orderId = req.query.orderId;

    // Define the aggregation pipeline stages
    const pipeline: any[] = [
      {
        $match: {
          buyer: userId,
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

    // Execute the aggregation pipeline
    const orders = await Order.aggregate(pipeline);

    const populatedOrders = await Order.populate(orders, {
      path: "items.product",
      select: "image name",
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
          "items.seller": sellerId,
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

    // Execute the aggregation pipeline
    const soldOrders: IOrder[] = await Order.aggregate(pipeline);

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
    const order: IOrder | null = await Order.findById(orderId);

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the user is authorized to access the order
    const { isAdmin } = req;
    const userId = req.userId!;
    if (
      !isAdmin &&
      order.buyer.toString() !== userId &&
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
        (item) => item.seller.toString() === userId
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
    const { status } = req.body;

    // Fetch the order by ID
    const order: IOrder | null = await Order.findById(orderId);

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the item in the order by ID
    const itemIndex = order.items.findIndex(
      (item) => item.product.toString() === itemId
    );

    // Check if the item exists in the order
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    // Fetch the product associated with the item
    const product = await Product.findById(order.items[itemIndex].product);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user is the seller of the product
    if (product.seller.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized: Only the seller can update delivery tracking",
      });
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

    // Save the updated order
    await order.save();

    // Return success response
    return res
      .status(200)
      .json({ message: "Delivery tracking updated successfully", order });
  } catch (error) {
    console.error("Error updating delivery tracking:", error);
    return res.status(500).json({ message: "Internal server error" });
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

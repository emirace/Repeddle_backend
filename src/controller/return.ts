import { Response } from "express";
import { CustomRequest } from "../middleware/user";
import Order, { IDeliveryTrackingHistory } from "../model/order";
import Return, { IReturn } from "../model/return";
import Notification from "../model/notification";
import mongoose from "mongoose";

export const createReturn = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId!; // Assuming `userId` is set by the authentication middleware
    const region = req.userRegion;
    const {
      orderId,
      productId,
      reason,
      refund,
      image,
      others,
      deliveryOption,
    } = req.body;

    // Find the order
    const order = await Order.findById(orderId).populate("items.product");

    if (!order) {
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });
    }

    // Check if the user is the buyer
    if (order.buyer.toString() !== userId.toString()) {
      return res.status(403).json({
        status: false,
        message: "You can only return products from your own orders",
      });
    }

    // Find the item in the order by ID
    const itemIndex = order.items.findIndex(
      (item: any) => item.product._id.toString() === productId.toString()
    );

    // Check if the item exists in the order
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    // Check if the delivery status is 'Received' and within 3 days
    const currentDeliveredStatus =
      order.items[itemIndex].deliveryTracking.currentStatus;
    if (currentDeliveredStatus.status !== "Delivered") {
      return res.status(400).json({
        status: false,
        message: "The product has not been delivered yet",
      });
    }

    const threeDaysAfterReceived = new Date(currentDeliveredStatus.timestamp);
    threeDaysAfterReceived.setDate(threeDaysAfterReceived.getDate() + 3);
    if (new Date() > threeDaysAfterReceived) {
      return res
        .status(400)
        .json({ status: false, message: "Return period has expired" });
    }

    const defaultDeliveryTracking = {
      currentStatus: { status: "Return Logged", timestamp: new Date() },
      history: [{ status: "Return Logged", timestamp: new Date() }],
    };

    // Create the return
    const newReturn = new Return({
      orderId,
      productId,
      reason,
      refund,
      image,
      others,
      region,
      deliveryOption,
      deliveryTracking: defaultDeliveryTracking,
    });

    // Add the current status to the delivery tracking history
    order.items[itemIndex].deliveryTracking.history.push(
      defaultDeliveryTracking.currentStatus
    );

    // Update the delivery tracking of the item
    order.items[itemIndex].deliveryTracking.currentStatus =
      defaultDeliveryTracking.currentStatus;

    let savedReturn = await newReturn.save();
    await order.save();

    // Populate the return with product and buyer details
    savedReturn = await savedReturn.populate({
      path: "productId",
      select: "images name",
      populate: { path: "seller", select: "name" },
    });

    savedReturn = await savedReturn.populate({
      path: "orderId",
      select: "buyer",
      populate: { path: "buyer", select: "name" },
    });

    res.status(201).json({ status: true, return: savedReturn });
  } catch (error) {
    console.log("Error making return ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getPurchaseReturns = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId!; // Assuming `userId` is set by the authentication middleware
    const { page = 1, limit = 20, search = "" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const userReturns = await Return.aggregate([
      // Join with the Products collection
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productId",
        },
      },
      { $unwind: "$productId" },
      // Join with the Users collection (Seller)
      {
        $lookup: {
          from: "users",
          localField: "productId.seller",
          foreignField: "_id",
          as: "productId.seller",
        },
      },
      { $unwind: "$productId.seller" },
      // Join with the Orders collection
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderId",
        },
      },
      { $unwind: "$orderId" },
      // Join with the Users collection (Buyer)
      {
        $lookup: {
          from: "users",
          localField: "orderId.buyer",
          foreignField: "_id",
          as: "orderId.buyer",
        },
      },
      { $unwind: "$orderId.buyer" },
      // Match the buyer's userId
      {
        $match: {
          "orderId.buyer._id": new mongoose.Types.ObjectId(userId),
        },
      },
      // Add regex search for `_id`
      ...(search
        ? [
            {
              $match: {
                $expr: {
                  $regexMatch: {
                    input: { $toString: "$_id" },
                    regex: search,
                    options: "i",
                  },
                },
              },
            },
          ]
        : []),
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          "productId.images": 1,
          "productId.name": 1,
          "productId.slug": 1,
          "productId.seller.username": 1,
          "orderId.buyer.username": 1,
          status: 1,
        },
      },
    ]);

    const totalReturns = await Return.aggregate([
      // Same lookups and match stages as above but just count
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productId",
        },
      },
      { $unwind: "$productId" },
      {
        $lookup: {
          from: "users",
          localField: "productId.seller",
          foreignField: "_id",
          as: "productId.seller",
        },
      },
      { $unwind: "$productId.seller" },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderId",
        },
      },
      { $unwind: "$orderId" },
      {
        $lookup: {
          from: "users",
          localField: "orderId.buyer",
          foreignField: "_id",
          as: "orderId.buyer",
        },
      },
      { $unwind: "$orderId.buyer" },
      {
        $match: {
          "orderId.buyer._id": new mongoose.Types.ObjectId(userId),
        },
      },
      ...(search
        ? [
            {
              $match: {
                $expr: {
                  $regexMatch: {
                    input: { $toString: "$_id" },
                    regex: search,
                    options: "i",
                  },
                },
              },
            },
          ]
        : []),
      { $count: "total" },
    ]);

    res.status(200).json({
      status: true,
      total: totalReturns[0]?.total || 0,
      currentPage: page,
      totalPages: Math.ceil((totalReturns[0]?.total || 0) / Number(limit)),
      returns: userReturns,
    });
  } catch (error) {
    console.log("Error fetching purchase returns", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getAllReturns = async (req: CustomRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 20, search = "" } = req.query;
    const matchStage: any = {};

    // Status filter
    if (status === "active") {
      matchStage["deliveryTracking.currentStatus.status"] = {
        $nin: ["Return Decline", "Refunded"],
      };
    }

    // Add regex search on `_id` as string
    if (search) {
      matchStage["$expr"] = {
        $regexMatch: {
          input: { $toString: "$_id" }, // Convert _id to string for regex search
          regex: search,
          options: "i", // Case-insensitive search
        },
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const userReturns = await Return.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productId",
        },
      },
      { $unwind: "$productId" },
      {
        $lookup: {
          from: "users",
          localField: "productId.seller",
          foreignField: "_id",
          as: "productId.seller",
        },
      },
      { $unwind: "$productId.seller" },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderId",
        },
      },
      { $unwind: "$orderId" },
      {
        $lookup: {
          from: "users",
          localField: "orderId.buyer",
          foreignField: "_id",
          as: "orderId.buyer",
        },
      },
      { $unwind: "$orderId.buyer" },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          "productId.images": 1,
          "productId.name": 1,
          "productId.slug": 1,
          "productId.seller.username": 1,
          "orderId.buyer.username": 1,
          status: 1,
        },
      },
    ]);

    const totalReturns = await Return.aggregate([
      { $match: matchStage },
      { $count: "total" },
    ]);

    res.status(200).json({
      status: true,
      total: totalReturns[0]?.total || 0,
      currentPage: page,
      totalPages: Math.ceil((totalReturns[0]?.total || 0) / Number(limit)),
      returns: userReturns,
    });
  } catch (error) {
    console.log("Error fetching user returns ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getSoldReturns = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId!; // Assuming `userId` is set by the authentication middleware
    const { page = 1, limit = 20, search = "" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const userReturns = await Return.aggregate([
      // Join with the Products collection
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productId",
        },
      },
      { $unwind: "$productId" },
      // Join with the Users collection (Seller)
      {
        $lookup: {
          from: "users",
          localField: "productId.seller",
          foreignField: "_id",
          as: "productId.seller",
        },
      },
      { $unwind: "$productId.seller" },
      // Join with the Orders collection
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderId",
        },
      },
      { $unwind: "$orderId" },
      // Join with the Users collection (Buyer)
      {
        $lookup: {
          from: "users",
          localField: "orderId.buyer",
          foreignField: "_id",
          as: "orderId.buyer",
        },
      },
      { $unwind: "$orderId.buyer" },
      // Match the seller's userId
      {
        $match: {
          "productId.seller._id": new mongoose.Types.ObjectId(userId),
        },
      },
      // Add regex search for `_id`
      ...(search
        ? [
            {
              $match: {
                $expr: {
                  $regexMatch: {
                    input: { $toString: "$_id" },
                    regex: search,
                    options: "i",
                  },
                },
              },
            },
          ]
        : []),
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          "productId.images": 1,
          "productId.name": 1,
          "productId.seller.username": 1,
          "productId.slug": 1,
          "orderId.buyer.username": 1,
          status: 1,
        },
      },
    ]);

    const totalReturns = await Return.aggregate([
      // Same lookups and match stages as above but just count
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productId",
        },
      },
      { $unwind: "$productId" },
      {
        $lookup: {
          from: "users",
          localField: "productId.seller",
          foreignField: "_id",
          as: "productId.seller",
        },
      },
      { $unwind: "$productId.seller" },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderId",
        },
      },
      { $unwind: "$orderId" },
      {
        $lookup: {
          from: "users",
          localField: "orderId.buyer",
          foreignField: "_id",
          as: "orderId.buyer",
        },
      },
      { $unwind: "$orderId.buyer" },
      {
        $match: {
          "productId.seller._id": new mongoose.Types.ObjectId(userId),
        },
      },
      ...(search
        ? [
            {
              $match: {
                $expr: {
                  $regexMatch: {
                    input: { $toString: "$_id" },
                    regex: search,
                    options: "i",
                  },
                },
              },
            },
          ]
        : []),
      { $count: "total" },
    ]);

    res.status(200).json({
      status: true,
      total: totalReturns[0]?.total || 0,
      currentPage: page,
      totalPages: Math.ceil((totalReturns[0]?.total || 0) / Number(limit)),
      returns: userReturns,
    });
  } catch (error) {
    console.log("Error fetching sold returns", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getReturnById = async (req: CustomRequest, res: Response) => {
  const { id: returnId } = req.params;
  const userId = req.userId!;
  const userRole = req.userRole;

  try {
    const foundReturn: any = await Return.findById(returnId)
      .populate({
        path: "productId",
        select: "images name slug",
        populate: { path: "seller", select: "username" },
      })
      .populate({
        path: "orderId",
        select: "buyer items",
        populate: { path: "buyer", select: "username" },
      });

    if (!foundReturn) {
      return res
        .status(404)
        .json({ status: false, message: "Return not found" });
    }

    const order = foundReturn.orderId as any;

    const isBuyer = order.buyer._id.toString() === userId.toString();
    const isSeller = order.items.some(
      (item: any) => item.seller.toString() === userId.toString()
    );

    if (!isBuyer && !isSeller && userRole !== "Admin") {
      return res.status(403).json({
        status: false,
        message: "You do not have permission to access this return",
      });
    }

    // Filter the items array to include only the item that matches the productId
    const filteredOrderItems = order.items.filter(
      (item: any) =>
        item.product.toString() === foundReturn.productId._id.toString()
    );

    // Create a new object to hold the filtered order details
    const filteredOrder = {
      ...order._doc,
      items: filteredOrderItems,
    };

    res.status(200).json({
      status: true,
      return: { ...foundReturn._doc, orderId: filteredOrder },
    });
  } catch (error) {
    console.error("Error fetching return by ID:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const updateReturnStatus = async (req: CustomRequest, res: Response) => {
  try {
    const returnId = req.params.id;
    const { status, adminReason } = req.body;
    const userRole = req.userRole; // Assuming the user role is set by the authentication middleware

    // Check if the user is an admin
    if (userRole !== "Admin") {
      return res.status(403).json({
        status: false,
        message: "You do not have permission to update the return status",
      });
    }

    if (status === "Declined" && !adminReason) {
      return res.status(400).json({
        status: false,
        message: "Reason for decline is require",
      });
    }

    // Find the return
    const foundReturn = await Return.findById(returnId)
      .populate({
        path: "productId",
        select: "images name slug",
        populate: { path: "seller", select: "username" },
      })
      .populate({
        path: "orderId",
        select: "buyer items",
        populate: { path: "buyer", select: "username" },
      });
    if (!foundReturn) {
      return res
        .status(404)
        .json({ status: false, message: "Return not found" });
    }

    // Update the status and adminReason if provided
    foundReturn.status = status;
    if (status === "Declined" && adminReason) {
      foundReturn.adminReason = adminReason;
    }

    // Update the delivery tracking status
    const newStatus: IDeliveryTrackingHistory = {
      status: "Return " + status,
      timestamp: new Date(),
    };
    foundReturn.deliveryTracking.currentStatus = newStatus;
    foundReturn.deliveryTracking.history.push(newStatus);

    // Save the updated return
    const updatedReturn: any = await foundReturn.save();

    await Notification.create({
      message: `Return ${status}`,
      link: `/return/${updatedReturn._id}`,
      user: updatedReturn.orderId.buyer._id,
      image: (foundReturn.productId as any).images[0],
      mobileLink: {
        name: `ReturnDetail`,
        params: { id: updatedReturn._id.toString() },
      },
    });

    res.status(200).json({ status: true, return: updatedReturn });
  } catch (error) {
    console.log("Error updating return status ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const updateUserDeliveryTracking = async (
  req: CustomRequest,
  res: Response
) => {
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Start transaction

  try {
    const returnId = req.params.id;
    const { status, trackingNumber } = req.body;
    const userId = req.userId!;

    // Find the return
    const foundReturn: any = await Return.findById(returnId)
      .populate({
        path: "productId",
        select: "images name slug",
        populate: { path: "seller", select: "username" },
      })
      .populate({
        path: "orderId",
        select: "buyer items",
        populate: { path: "buyer", select: "username" },
      })
      .session(session); // Pass the session to the query

    if (!foundReturn) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ status: false, message: "Return not found" });
    }

    // Check if the user is the buyer or seller
    const isBuyer =
      foundReturn.orderId.buyer._id.toString() === userId.toString();
    const isSeller =
      foundReturn.productId.seller._id.toString() === userId.toString();

    if (!isBuyer && !isSeller) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        status: false,
        message:
          "You do not have permission to update the delivery tracking status",
      });
    }

    // Ensure that only the seller can update the status other than "Return Received"
    if (status !== "Return Received" && !isBuyer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: "Unauthorized: Only the buyer can update the status",
      });
    }

    // Ensure that only the buyer can update the status to "Return Received"
    if (status === "Return Received" && !isSeller) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message:
          "Unauthorized: Only the seller can update the status to Received",
      });
    }

    // Check if the new status is different from current status and history
    const allStatuses = [
      foundReturn.deliveryTracking.currentStatus.status,
      ...foundReturn.deliveryTracking.history.map(
        (entry: { status: any }) => entry.status
      ),
    ];
    if (allStatuses.includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ status: false, message: "Cannot update to a previous status" });
    }

    // Update the delivery tracking status for the return
    const newStatus: IDeliveryTrackingHistory = {
      status: status,
      timestamp: new Date(),
    };

    foundReturn.deliveryTracking.currentStatus = newStatus;
    foundReturn.deliveryTracking.history.push(newStatus);

    if (trackingNumber) {
      foundReturn.trackingNumber = trackingNumber;
    }

    // Save the updated return with session
    const updatedReturn = await foundReturn.save({ session });

    // Update the product's delivery tracking status in the order
    const order = await Order.findById(foundReturn.orderId._id).session(
      session
    );

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });
    }

    // Find the specific product in the order's items
    const itemIndex = order.items.findIndex(
      (item) => item.product.toString() === foundReturn.productId._id.toString()
    );

    if (itemIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ status: false, message: "Product not found in the order" });
    }

    const initialProductTrackingStatus: IDeliveryTrackingHistory = {
      status: order.items[itemIndex].deliveryTracking.currentStatus.status,
      timestamp:
        order.items[itemIndex].deliveryTracking.currentStatus.timestamp,
    };
    // Update the delivery tracking status of the product in the order
    const productTrackingStatus: IDeliveryTrackingHistory = {
      status: status, // Set the same status as the return
      timestamp: new Date(),
    };

    order.items[itemIndex].deliveryTracking.currentStatus =
      productTrackingStatus;
    order.items[itemIndex].deliveryTracking.history.push(
      initialProductTrackingStatus
    );

    // Save the updated order with session
    await order.save({ session });

    // Create notification for the status update
    await Notification.create(
      {
        message: `${status}`,
        link: `/return/${updatedReturn._id}`,
        user: isBuyer
          ? updatedReturn.productId.seller._id
          : updatedReturn.orderId.buyer._id,
        image: (foundReturn.productId as any).images[0],
        mobileLink: {
          name: `ReturnDetail`,
          params: { id: updatedReturn._id.toString() },
        },
      },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ status: true, return: updatedReturn });
  } catch (error) {
    // Abort transaction if there's an error
    await session.abortTransaction();
    session.endSession();

    console.log("Error updating return delivery tracking status ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const updateReturnDeliveryAddress = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const returnId = req.params.id;
    const { fee, method } = req.body;
    const userId = req.userId!;

    // Find the return
    const foundReturn:
      | (IReturn & {
          orderId: { buyer: { _id: string } };
          productId: { seller: { _id: string } };
        })
      | null = await Return.findById(returnId)
      .populate({
        path: "productId",
        select: "images name",
        populate: { path: "seller", select: "username" },
      })
      .populate({
        path: "orderId",
        select: "buyer items",
        populate: { path: "buyer", select: "username" },
      });

    if (!foundReturn) {
      return res
        .status(404)
        .json({ status: false, message: "Return not found" });
    }
    const isSeller =
      foundReturn.productId.seller._id.toString() === userId.toString();

    if (!isSeller) {
      return res.status(403).json({
        status: false,
        message: "You do not have permission to update the delivery address",
      });
    }

    foundReturn.deliverySelected = { fee, method };

    // Save the updated return
    const updatedReturn = await foundReturn.save();

    await Notification.create({
      message: `Return address updated`,
      link: `/return/${updatedReturn._id}`,
      user: updatedReturn.orderId.buyer._id,
      image: (foundReturn.productId as any).images[0],
      mobileLink: {
        name: `ReturnDetail`,
        params: { id: updatedReturn._id.toString() },
      },
    });

    res.status(200).json({ status: true, return: updatedReturn });
  } catch (error) {
    console.log("Error updating return delivery tracking status ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

import { Response } from "express";
import { CustomRequest } from "../middleware/user";
import Order, { IDeliveryTrackingHistory } from "../model/order";
import Return, { IReturn } from "../model/return";

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

    const returns = await Return.find()
      .populate({
        path: "productId",
        select: "images name",
        populate: { path: "seller", select: "username image" },
      })
      .populate({
        path: "orderId",
        select: "buyer",
        populate: { path: "buyer", select: "username image" },
      });

    const userReturns = returns.filter(
      (returnItem: any) => returnItem.orderId.buyer._id.toString() === userId
    );

    res.status(200).json({ status: true, returns: userReturns });
  } catch (error) {
    console.log("Error fetching user returns ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getAllReturns = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId!; // Assuming `userId` is set by the authentication middleware

    const userReturns = await Return.find()
      .populate({
        path: "productId",
        select: "images name",
        populate: { path: "seller", select: "username" },
      })
      .populate({
        path: "orderId",
        select: "buyer",
        populate: { path: "buyer", select: "username" },
      });

    res.status(200).json({ status: true, returns: userReturns });
  } catch (error) {
    console.log("Error fetching user returns ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getSoldReturns = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId!; // Assuming `userId` is set by the authentication middleware

    const returns = await Return.find()
      .populate({
        path: "productId",
        select: "images name",
        populate: { path: "seller", select: "username" },
      })
      .populate({
        path: "orderId",
        select: "buyer",
        populate: { path: "buyer", select: "username" },
      });

    const userReturns = returns.filter(
      (returnItem: any) => returnItem.productId.seller._id.toString() === userId
    );

    res.status(200).json({ status: true, returns: userReturns });
  } catch (error) {
    console.log("Error fetching user returns ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getReturnById = async (req: CustomRequest, res: Response) => {
  const { id: returnId } = req.params;
  const userId = req.userId!;
  const userRole = req.userRole; // Assuming the user role is set by the authentication middleware

  try {
    const foundReturn: any = await Return.findById(returnId)
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

    const order = foundReturn.orderId as any;

    const isBuyer = order.buyer._id.toString() === userId.toString();
    const isSeller = order.items.some(
      (item: any) => item.seller.toString() === userId.toString()
    );

    if (!isBuyer && !isSeller && userRole !== "admin") {
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

    // Find the return
    const foundReturn = await Return.findById(returnId);
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
    const updatedReturn = await foundReturn.save();

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
  try {
    const returnId = req.params.id;
    const { status, trackingNumber } = req.body;
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
        select: "buyer",
        populate: { path: "buyer", select: "username" },
      });

    if (!foundReturn) {
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
      return res.status(403).json({
        status: false,
        message:
          "You do not have permission to update the delivery tracking status",
      });
    }

    // Ensure that only the seller can update the status other than "Return Received"
    if (status !== "Return Received" && !isBuyer) {
      return res.status(403).json({
        message: "Unauthorized: Only the buyer can update the status",
      });
    }

    // Ensure that only the buyer can update the status to "Return Received"
    if (status === "Return Received" && !isSeller) {
      return res.status(403).json({
        message:
          "Unauthorized: Only the seller can update the status to Received",
      });
    }

    // Check if the new status is different from current status and history
    const allStatuses = [
      foundReturn.deliveryTracking.currentStatus.status,
      ...foundReturn.deliveryTracking.history.map((entry) => entry.status),
    ];
    if (allStatuses.includes(status)) {
      return res
        .status(400)
        .json({ status: false, message: "Cannot update to a previous status" });
    }

    // Update the delivery tracking status
    const newStatus: IDeliveryTrackingHistory = {
      status: status,
      timestamp: new Date(),
    };
    foundReturn.deliveryTracking.currentStatus = newStatus;
    foundReturn.deliveryTracking.history.push(newStatus);

    if (trackingNumber) {
      foundReturn.trackingNumber = trackingNumber;
    }

    // Save the updated return
    const updatedReturn = await foundReturn.save();

    res.status(200).json({ status: true, return: updatedReturn });
  } catch (error) {
    console.log("Error updating return delivery tracking status ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

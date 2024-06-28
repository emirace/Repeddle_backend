import { Response } from "express";
import { CustomRequest } from "../middleware/user";
import Order, { IDeliveryTrackingHistory } from "../model/order";
import Return, { IReturn } from "../model/return";

export const createReturn = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId!; // Assuming `userId` is set by the authentication middleware
    const {
      orderId,
      productId,
      reason,
      refund,
      image,
      others,
      region,
      deliveryOption,
    } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
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

    // Check if the product is in the order
    const orderItem = order.items.find(
      (item) => item.product.toString() === productId.toString()
    );
    if (!orderItem) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found in the order" });
    }

    // Check if the delivery status is 'Received' and within 3 days
    const receivedStatus = orderItem.deliveryTracking.history.find(
      (status) => status.status === "Received"
    );
    if (!receivedStatus) {
      return res.status(400).json({
        status: false,
        message: "The product has not been received yet",
      });
    }

    const threeDaysAfterReceived = new Date(receivedStatus.timestamp);
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

    let savedReturn = await newReturn.save();

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

    const userReturns = await Return.find({ "orderId.buyer": userId })
      .populate({
        path: "productId",
        select: "images name",
        populate: { path: "seller", select: "name" },
      })
      .populate({
        path: "orderId",
        select: "buyer",
        populate: { path: "buyer", select: "name" },
      });

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
        populate: { path: "seller", select: "name" },
      })
      .populate({
        path: "orderId",
        select: "buyer",
        populate: { path: "buyer", select: "name" },
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

    const userReturns = await Return.find({ "productId.seller": userId })
      .populate({
        path: "productId",
        select: "images name",
        populate: { path: "seller", select: "name" },
      })
      .populate({
        path: "orderId",
        select: "buyer",
        populate: { path: "buyer", select: "name" },
      });

    res.status(200).json({ status: true, returns: userReturns });
  } catch (error) {
    console.log("Error fetching user returns ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getReturnById = async (req: CustomRequest, res: Response) => {
  try {
    const returnId = req.params.id;
    const userId = req.userId!;
    const userRole = req.userRole; // Assuming the user role is set by the authentication middleware

    const foundReturn = await Return.findById(returnId)
      .populate({
        path: "productId",
        select: "images name",
        populate: { path: "seller", select: "name" },
      })
      .populate({
        path: "orderId",
        select: "buyer",
        populate: { path: "buyer", select: "name" },
      });

    if (!foundReturn) {
      return res
        .status(404)
        .json({ status: false, message: "Return not found" });
    }

    const order = await Order.findById(foundReturn.orderId).select(
      "buyer items"
    );
    if (!order) {
      return res
        .status(404)
        .json({ status: false, message: "Associated order not found" });
    }

    const isBuyer = order.buyer.toString() === userId.toString();
    const isSeller = order.items.some(
      (item) => item.seller.toString() === userId.toString()
    );

    if (!isBuyer && !isSeller && userRole !== "admin") {
      return res.status(403).json({
        status: false,
        message: "You do not have permission to access this return",
      });
    }

    res.status(200).json({ status: true, return: foundReturn });
  } catch (error) {
    console.log("Error fetching return by ID ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const updateReturnStatus = async (req: CustomRequest, res: Response) => {
  try {
    const returnId = req.params.id;
    const { status, adminReason } = req.body;
    const userRole = req.userRole; // Assuming the user role is set by the authentication middleware

    // Check if the user is an admin
    if (userRole !== "admin") {
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
    if (status === "Decline" && adminReason) {
      foundReturn.adminReason = adminReason;
    }

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
    const { status } = req.body;
    const userId = req.userId!;

    // Find the return
    const foundReturn:
      | (IReturn & {
          orderId: { buyer: { _id: string } };
          productId: { seller: string };
        })
      | null = await Return.findById(returnId).populate({
      path: "orderId",
      select: "buyer",
      populate: { path: "buyer", select: "name" },
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
      foundReturn.productId.seller.toString() === userId.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        status: false,
        message:
          "You do not have permission to update the delivery tracking status",
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

    // Save the updated return
    const updatedReturn = await foundReturn.save();

    res.status(200).json({ status: true, return: updatedReturn });
  } catch (error) {
    console.log("Error updating return delivery tracking status ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

import { Response } from "express";
import { CustomRequest } from "../middleware/user";
import Order from "../model/order";
import Return from "../model/return";

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
      select: "image name",
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

export const getUserReturns = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId!; // Assuming `userId` is set by the authentication middleware

    const userReturns = await Return.find({ "orderId.buyer": userId })
      .populate({
        path: "productId",
        select: "image name",
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

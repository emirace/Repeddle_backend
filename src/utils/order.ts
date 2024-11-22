import { io } from "../app";
import Notification from "../model/notification";
import Order, { IOrder } from "../model/order";
import User from "../model/user";

// Helper function to check if the user is the seller of any item in the order
export const isUserSeller = (order: IOrder, userId: string) => {
  return order.items.some((item) => item.seller.toString() === userId);
};

export const deliveryStatusMap: Record<
  string,
  { days: number; next?: string; notifyTo: "seller" | "buyer" }
> = {
  Processing: { days: 2, next: "Dispatched", notifyTo: "seller" },
  Dispatched: { days: 3, next: "In Transit", notifyTo: "buyer" },
  "In Transit": { days: 3, next: "Delivered", notifyTo: "buyer" },
  Delivered: { days: 7, next: "Received", notifyTo: "buyer" },
  // Received: { days: 0, next: null, notifyTo: null },
  // "Return Logged": { days: 0, next: null, notifyTo: null },
  // "Return Declined": { days: 0, next: null, notifyTo: null },
  "Return Approved": { days: 3, next: "Return Dispatched", notifyTo: "buyer" },
  "Return Dispatched": { days: 5, next: "Return Delivered", notifyTo: "buyer" },
  "Return Delivered": { days: 3, next: "Return Received", notifyTo: "seller" },
  // "Return Received": { days: 0, next: null, notifyTo: null },
  // Refunded: { days: 0, next: null, notifyTo: null },
  // "Payment to Seller Initiated": { days: 0, next: null, notifyTo: null },
};

export const sendOrderNotifications = async () => {
  const now = new Date();

  // Get active statuses (statuses with `days > 0`)
  const activeStatuses = Object.keys(deliveryStatusMap).filter(
    (status) => deliveryStatusMap[status]?.days > 0
  );

  // Fetch only orders with items in active statuses
  const orders = await Order.find({
    "items.deliveryTracking.currentStatus.status": { $in: activeStatuses },
  }).select("items buyer"); // Fetch only necessary fields
  console.log(orders);

  const bulkUpdates = [];

  for (const order of orders) {
    for (const item of order.items) {
      const { currentStatus } = item.deliveryTracking;
      const { status, timestamp, lastNotification } = currentStatus;

      // Get the notification rules for the current status
      const { days, next, notifyTo } = deliveryStatusMap[status] || {};
      if (!days || days <= 0) continue; // Skip non-notifiable statuses

      const notificationDeadline = new Date(
        new Date(timestamp).getTime() + days * 24 * 60 * 60 * 1000
      );

      // Check if a notification is needed
      if (
        now >= notificationDeadline &&
        (!lastNotification || new Date(lastNotification) < timestamp)
      ) {
        const recipient = notifyTo === "seller" ? item.seller : order.buyer;
        const message = `Unattended Order: 12hrs left to mark order as '${next}'.`;

        // Create and emit notification
        const notification = await Notification.create({
          message,
          link: `/order/${order._id}`,
          user: recipient,
        });

        const recipientUser = await User.findById(recipient).select("socketId");
        if (recipientUser?.socketId) {
          io.to(recipientUser.socketId).emit("newNotification", notification);
        }

        // Update the lastNotification timestamp locally
        currentStatus.lastNotification = now;

        // Add the update to the bulk operation array
        bulkUpdates.push({
          updateOne: {
            filter: { _id: order._id, "items._id": (item as any)._id },
            update: {
              "items.$.deliveryTracking.currentStatus.lastNotification": now,
            },
          },
        });
      }
    }
  }

  // Perform bulk updates in one go for better performance
  if (bulkUpdates.length > 0) {
    await Order.bulkWrite(bulkUpdates);
  }
};

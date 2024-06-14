import { Response } from "express";
import { CustomRequest } from "../middleware/user";
import Notification, { INotification } from "../model/notification";

export const getUserNotifications = async (
  req: CustomRequest,
  res: Response
) => {
  const userId = req.userId;
  const { filter } = req.query;

  if (!userId) {
    return res.status(404).json({ message: "User not found" });
  }

  let query: { user: string; read?: boolean } = { user: userId };

  // Apply filter if provided
  if (filter) {
    if (filter === "read") {
      query = { ...query, read: true };
    } else if (filter === "unread") {
      query = { ...query, read: false };
    }
    // If filter is 'all', no need to modify the query
  }

  try {
    const notifications: INotification[] = await Notification.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markNotificationAsRead = async (
  req: CustomRequest,
  res: Response
) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

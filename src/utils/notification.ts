import { Types } from "mongoose";
import DotNotification, { IDotNotification } from "../model/dotNotification";
import { Server } from "socket.io";
import User from "../model/user";

export const createNotification = async (
  userId: Types.ObjectId | string,
  type: string,
  io: Server
): Promise<void> => {
  try {
    await DotNotification.create({
      user: userId,
      type,
    });

    const userNotifications = await DotNotification.find({
      user: userId,
    });

    const user = await User.findById(userId);
    if (user && user.socketId) {
      io.to(user.socketId).emit("notificationsUpdated", userNotifications);
    }
  } catch (error) {
    console.log("Error creating notification:", error);
  }
};

export const getUrlByCountryCode = (
  countryCode: string
): string | undefined => {
  const countryToCurrency: Record<string, string> = {
    NG: ".com",
    ZA: ".co.za",
  };
  return countryToCurrency[countryCode.toUpperCase()];
};

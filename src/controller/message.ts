// controllers/messageController.ts

import { Request, Response } from "express";
import Message from "../model/message";
import { CustomRequest } from "../middleware/user";
import User from "../model/user";

// Send a message
export const sendMessage = async (req: CustomRequest, res: Response) => {
  try {
    // Extract message data from request body
    const { receiver, content, referencedUser, referencedProduct } = req.body;
    const sender = req.userId;

    // Check if sender and receiver are valid user IDs
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid receiver" });
    }

    // Prevent user from messaging themselves
    if (sender === receiver) {
      return res
        .status(400)
        .json({ status: false, message: "Cannot message yourself" });
    }

    // Create a new message instance
    const newMessage = new Message({
      sender,
      receiver,
      content,
      referencedUser,
      referencedProduct,
    });

    // Save the message to the database
    const savedMessage = await newMessage.save();

    // Access the io instance from the app
    const io = req.app.get("io");

    // Emit the new message event to the receiver's Socket ID if available
    if (receiverUser && receiverUser.socketId) {
      io.to(receiverUser.socketId).emit("newMessage", {
        status: true,
        message: savedMessage,
      });
    }

    // Respond with the saved message
    res.status(201).json({ status: true, message: savedMessage });
  } catch (error) {
    // Handle errors
    res
      .status(500)
      .json({ status: false, message: "Failed sending message", error });
  }
};

// Retrieve messages between two users
export const getMessages = async (req: CustomRequest, res: Response) => {
  try {
    // Extract sender and receiver from request parameters
    const { receiver } = req.params;
    const sender = req.userId;

    // Check if sender and receiver are valid user IDs
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid receiver" });
    }

    // Find messages between the sender and receiver
    const messages = await Message.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    // Respond with the retrieved messages
    res.json({ status: true, messages });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: "Error getting messages", error });
  }
};

// Forward a message
export const forwardMessage = async (req: CustomRequest, res: Response) => {
  try {
    // Extract necessary data from request body
    const { receiver, messageId, referencedUser, referencedProduct } = req.body;
    const sender = req.userId;

    // Check if sender and receiver are valid user IDs
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid receiver" });
    }

    // Prevent user from messaging themselves
    if (sender === receiver) {
      return res
        .status(400)
        .json({ status: false, message: "Cannot message yourself" });
    }

    // Find the message to forward by its ID
    const messageToForward = await Message.findById(messageId);
    if (!messageToForward) {
      return res
        .status(404)
        .json({ status: false, message: "Message not found" });
    }

    // Create a new message based on the forwarded message
    const newMessage = new Message({
      sender,
      receiver,
      content: messageToForward.content,
      forwardedFrom: messageToForward._id, // Optional: Forwarded message ID
      referencedUser,
      referencedProduct,
    });

    // Save the new message to the database
    const savedMessage = await newMessage.save();

    // Access the io instance from the app
    const io = req.app.get("io");

    // Emit the new message event to the receiver's Socket ID if available
    if (receiverUser && receiverUser.socketId) {
      io.to(receiverUser.socketId).emit("newMessage", {
        status: true,
        message: savedMessage,
      });
    }

    // Respond with the saved message
    res.status(201).json({ status: true, message: savedMessage });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: "Error forwarding message", error });
  }
};

// Reply to a message
export const replyToMessage = async (req: CustomRequest, res: Response) => {
  try {
    // Extract necessary data from request body
    const { receiver, content, replyTo, referencedUser, referencedProduct } =
      req.body;
    const sender = req.userId;

    // Check if sender and receiver are valid user IDs
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid receiver" });
    }

    // Prevent user from messaging themselves
    if (sender === receiver) {
      return res
        .status(400)
        .json({ status: false, message: "Cannot message yourself" });
    }

    // Find the message to reply to by its ID
    const repliedMessage = await Message.findById(replyTo);
    if (!repliedMessage) {
      return res
        .status(404)
        .json({ status: false, message: "Message not found" });
    }

    // Create a new message as a reply to the original message
    const newMessage = new Message({
      sender,
      receiver,
      content,
      replyTo: repliedMessage._id, // Optional: Replied message ID
      referencedUser,
      referencedProduct,
    });

    // Save the new message to the database
    const savedMessage = await newMessage.save();

    // Access the io instance from the app
    const io = req.app.get("io");

    // Emit the new message event to the receiver's Socket ID if available
    if (receiverUser && receiverUser.socketId) {
      io.to(receiverUser.socketId).emit("newMessage", {
        status: true,
        message: savedMessage,
      });
    }

    // Respond with the saved message
    res.status(201).json({ status: true, message: savedMessage });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: "Error replying to message", error });
  }
};

// Get list of conversations for a user
export const getConversations = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    // Find conversations where the user is either the sender or receiver
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$receiver",
              else: "$sender",
            },
          },
          lastMessage: { $last: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users", // Assuming the user collection name is 'users'
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "messages", // Assuming the message collection name is 'messages'
          let: { otherUserId: "$_id" },
          pipeline: [
            {
              $match: {
                sender: userId,
                receiver: "$$otherUserId",
                read: false, // Only count unread messages
              },
            },
            {
              $count: "unreadCount",
            },
          ],
          as: "unreadMessages",
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          userName: { $arrayElemAt: ["$user.username", 0] }, // Assuming user document has a 'name' field
          userImage: { $arrayElemAt: ["$user.image", 0] }, // Assuming user document has a 'name' field
          lastMessage: {
            content: "$lastMessage.content",
            createdAt: "$lastMessage.createdAt",
            sender: "$lastMessage.sender",
            receiver: "$lastMessage.receiver",
          },
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ["$unreadMessages.unreadCount", 0] }, 0],
          },
        },
      },
    ]);

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations", error });
  }
};

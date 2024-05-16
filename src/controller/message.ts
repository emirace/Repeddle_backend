// controllers/messageController.ts

import { Request, Response } from "express";
import Message, { IMessage } from "../model/message";
import { CustomRequest } from "../middleware/user";
import User, { IUser } from "../model/user";
import Conversation, { IConversation } from "../model/conversation";

// Send a message
export const sendMessage = async (req: CustomRequest, res: Response) => {
  try {
    const {
      content,
      conversationId,
      referencedUser,
      referencedProduct,
      participantId,
      type,
    } = req.body;
    const sender = req.userId!;

    let conversation;

    // Create or find conversation
    if (!conversationId) {
      if (!participantId || !type) {
        return res.status(400).json({
          status: false,
          message: "ParticipantId and type are required",
        });
      }

      conversation = await Conversation.findOneAndUpdate(
        {
          participants: { $all: [sender, participantId] },
          type,
        },
        { $setOnInsert: { participants: [sender, participantId], type } },
        { upsert: true, new: true }
      );
    } else {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      return res.status(400).json({
        status: false,
        message: "Unable to find or create conversation",
      });
    }

    // Ensure sender is part of conversation
    if (!conversation.participants.includes(sender)) {
      return res.status(400).json({
        status: false,
        message: "Invalid conversation or unauthorized access",
      });
    }

    // Determine the receiver from the conversation
    const receiver = conversation.participants.find(
      (participant) => participant !== sender.toString()
    );
    if (!receiver) {
      return res.status(400).json({
        status: false,
        message: "Receiver not found in the conversation",
      });
    }

    // Create and save message
    const newMessage = new Message({
      sender,
      conversationId: conversation?._id,
      receiver,
      content,
      referencedUser,
      referencedProduct,
    });
    const savedMessage = await newMessage.save();

    // Access the io instance from the app
    const io = req.app.get("io");

    // Emit the new message event to the receiver's Socket ID if available
    const receiverUser = await User.findById(receiver);
    if (receiverUser?.socketId) {
      io.to(receiverUser.socketId).emit("message", savedMessage);
    }

    // Respond with the saved message
    res.status(201).json({ status: true, message: savedMessage });
  } catch (error) {
    // Handle errors
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed sending message", error });
  }
};

// Retrieve messages between two users
export const getMessages = async (req: CustomRequest, res: Response) => {
  try {
    // Extract sender and receiver from request parameters
    const { conversationId } = req.params;
    const userId = req.userId!;

    // Check if conversation exists and if the user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ status: false, message: "Conversation not found" });
    }
    if (!conversation.participants.includes(userId)) {
      return res
        .status(403)
        .json({ status: false, message: "Access forbidden" });
    }

    // Find messages in the conversation and sort by createdAt
    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    // Respond with the retrieved messages
    res.json({ status: true, messages });
  } catch (error) {
    // Handle errors
    console.error("Error getting messages:", error);
    res.status(500).json({ message: "Error getting messages", error });
  }
};

// Forward a message
export const forwardMessage = async (req: CustomRequest, res: Response) => {
  try {
    // Extract necessary data from request body
    const { receiver, messageId } = req.body;
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
      conversationId: messageToForward.conversationId,
      sender,
      receiver,
      content: messageToForward.content,
      forwardedFrom: messageToForward._id, // Optional: Forwarded message ID
      referencedUser: messageToForward.referencedUser,
      referencedProduct: messageToForward.referencedProduct,
    });

    // Save the new message to the database
    const savedMessage = await newMessage.save();

    // Access the io instance from the app
    const io = req.app.get("io");

    // Emit the new message event to the receiver's Socket ID if available
    if (receiverUser && receiverUser.socketId) {
      io.to(receiverUser.socketId).emit("message", {
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
    const { receiver, content, replyTo } = req.body;
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
      referencedUser: repliedMessage.referencedUser,
      referencedProduct: repliedMessage.referencedProduct,
    });

    // Save the new message to the database
    const savedMessage = await newMessage.save();

    // Access the io instance from the app
    const io = req.app.get("io");

    // Emit the new message event to the receiver's Socket ID if available
    if (receiverUser && receiverUser.socketId) {
      io.to(receiverUser.socketId).emit("message", {
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

export const getUserConversations = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { type } = req.params;
    const userId = req.userId as string;

    const conversations: IConversation[] = await Conversation.find({
      participants: userId,
      type,
    });

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation: IConversation) => {
        const lastMessage: IMessage | null = await Message.findOne({
          conversationId: conversation._id,
        }).sort({ createdAt: -1 });
        const otherUserId: string = conversation.participants.find(
          (id) => id !== userId.toString()
        ) as string;
        const otherUser = await User.findById(otherUserId).select(
          "username image"
        );

        return {
          ...conversation.toObject(),
          lastMessage,
          otherUser: otherUser
            ? { username: otherUser.username, image: otherUser.image }
            : undefined,
        };
      })
    );

    const conversationsWithUnreadCount = await Promise.all(
      conversationsWithDetails.map(async (conversation) => {
        const unreadMessages: IMessage[] = await Message.find({
          conversationId: conversation._id,
          receiver: userId,
          read: false,
        });
        const unreadCount: number = unreadMessages.length;

        return { ...conversation, unreadCount };
      })
    );

    res.json({ conversations: conversationsWithUnreadCount });
  } catch (error) {
    console.error("Error fetching user conversations by type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const startConversation = async (req: CustomRequest, res: Response) => {
  try {
    const { participantId, type } = req.body;
    const userId = req.userId;

    // Check if the conversation already exists
    let existingConversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
      type,
    });

    if (existingConversation) {
      return res.json({ status: true, conversation: existingConversation }); // Return existing conversation
    }

    // If conversation doesn't exist, create a new one
    const newConversation = await Conversation.create({
      participants: [userId, participantId],
      type,
    });

    res.status(201).json({ status: true, Conversation: newConversation });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: false, message: "Error Starting conversations", error });
  }
};

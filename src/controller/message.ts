// controllers/messageController.ts

import { Request, Response } from "express";
import Message, { IMessage } from "../model/message";
import { CustomRequest } from "../middleware/user";
import User, { IUser } from "../model/user";
import Conversation, { IConversation } from "../model/conversation";
import mongoose from "mongoose";

// Send a message
export const sendMessage = async (req: CustomRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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
    const role = req.userRole;

    let conversation;

    // Create or find conversation
    if (!conversationId) {
      if (!type) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: false,
          message: "Type is required",
        });
      }

      if (type === "Chat" && !participantId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: false,
          message: "participantId is required",
        });
      }

      let query = { participants: { $all: [sender] }, type };

      if (participantId) {
        query = { participants: { $all: [sender, participantId] }, type };
      }

      conversation = await Conversation.findOneAndUpdate(
        query,
        {
          $setOnInsert: {
            participants: participantId ? [sender, participantId] : [sender],
            type,
            isGuest: role === "Guest",
          },
        },
        { upsert: true, new: true, session }
      );
    } else {
      conversation = await Conversation.findById(conversationId).session(
        session
      );
    }

    if (!conversation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: false,
        message: "Unable to find or create conversation",
      });
    }

    // Ensure sender is part of conversation
    if (!conversation.participants.includes(sender)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: false,
        message: "Invalid conversation or unauthorized access",
      });
    }

    // Determine the receiver from the conversation if participants exist
    let receiver;
    if (conversation.participants.length > 1) {
      receiver = conversation.participants.find(
        (participant) => participant !== sender.toString()
      );
      if (!receiver) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: false,
          message: "Receiver not found in the conversation",
        });
      }
    }

    // Create and save message
    const newMessage = new Message({
      sender,
      conversationId: conversation._id,
      receiver,
      content,
      referencedUser,
      referencedProduct,
    });
    const savedMessage = await newMessage.save({ session });

    // Access the io instance from the app
    const io = req.app.get("io");

    // Fetch receiver user and admin users in parallel
    const [receiverUser, adminUsers] = await Promise.all([
      receiver ? User.findById(receiver).session(session) : null,
      type !== "Chat" ? User.find({ role: "Admin" }).session(session) : [],
    ]);
    if (receiverUser && receiverUser.socketId) {
      if (receiverUser.socketId) {
        io.to(receiverUser.socketId).emit("message", savedMessage, type);
      } else if (conversation.isGuest) {
        //send email
      }
    } else if (type !== "Chat") {
      adminUsers.forEach((user: any) => {
        console.log(user.username);
        if (user.socketId) {
          io.to(user.socketId).emit("message", savedMessage, type);
        }
      });
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Respond with the saved message
    res.status(201).json({ status: true, message: savedMessage });
  } catch (error) {
    // Abort the transaction in case of errors
    await session.abortTransaction();
    session.endSession();

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
    const { conversationId } = req.params;
    const userId = req.userId!;
    const role = req.userRole;

    // Find the conversation and ensure it exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ status: false, message: "Conversation not found" });
    }

    // Check if the user is a participant in the conversation
    const isParticipant = conversation.participants.includes(userId);

    // Admins can access all non-'Chat' conversations and their own 'Chat' conversations
    if (role === "Admin") {
      if (conversation.type === "Chat" && !isParticipant) {
        return res
          .status(403)
          .json({ status: false, message: "Access forbidden" });
      }
    } else {
      // Regular users can only access conversations they are participants of
      if (!isParticipant) {
        return res
          .status(403)
          .json({ status: false, message: "Access forbidden" });
      }
    }

    // Retrieve and return messages
    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });
    res.json({ status: true, messages });
  } catch (error) {
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
export const getUserConversations = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { type } = req.params;
    const userId = req.userId as string;
    const role = req.userRole;

    let conversations;

    // Check if the user is an admin and the type is not 'Chat'
    if (role === "Admin" && type !== "Chat") {
      // Get all conversations of the specified type
      console.log("admin and not chat");
      conversations = await Conversation.find({ type });
    } else {
      // Get conversations where the user is a participant and of the specified type
      console.log("not admin and  chat");
      conversations = await Conversation.find({
        participants: userId,
        type,
        closed: false,
      });
    }

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({
          conversationId: conversation._id,
        }).sort({ createdAt: -1 });
        const otherUserId = conversation.participants.find(
          (id) => id !== userId.toString()
        );
        const otherUser = otherUserId
          ? await User.findById(otherUserId).select("username image")
          : null;

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
        const unreadMessages = await Message.find({
          conversationId: conversation._id,
          receiver: userId,
          read: false,
        });
        const unreadCount = unreadMessages.length;

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

    res.status(201).json({ status: true, conversation: newConversation });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: false, message: "Error Starting conversations", error });
  }
};

export const joinConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { adminId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    // Find the conversation by ID
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if the conversation is of type "Support" or "Report"
    if (conversation.type !== "Support" && conversation.type !== "Report") {
      return res
        .status(400)
        .json({
          message: "Only Support or Report conversations can be joined",
        });
    }

    // Check if there is exactly one participant
    if (conversation.participants.length > 1) {
      return res
        .status(400)
        .json({ message: "Issue is been handled by other admin" });
    }

    // Add the admin to the participants if not already present
    if (!conversation.participants.includes(adminId)) {
      conversation.participants.push(adminId);
      await conversation.save();
    }

    res
      .status(200)
      .json({
        status: true,
        message: "Admin added to the conversation",
        conversation,
      });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

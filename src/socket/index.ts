import { Server } from "socket.io";
import User from "../model/user";
import Message from "../model/message";
import Conversation from "../model/conversation";

export const defaultSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected to all namespace: ${socket.id}`);

    // Capture Socket ID and associate it with user ID
    socket.on("login", async (userId) => {
      try {
        // Update or create user's Socket ID in the database
        const user = await User.findByIdAndUpdate(
          userId,
          { socketId: socket.id },
          { upsert: true }
        );
        if (user) {
          console.log(
            `User ${user.username} (ID: ${user._id}, soket: ${user.socketId}) logged in.`
          );
        }
      } catch (error) {
        console.error("Error updating user socket ID:", error);
      }
    });

    socket.on("markAsRead", async ({ conversationId, userId }) => {
      try {
        // Mark all messages in the conversation as read for the specified user
        await Message.updateMany(
          { conversationId, receiver: userId },
          { read: true }
        );

        // Emit a confirmation message or update to the client if necessary
        socket.emit("messagesRead");
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    socket.on("typing", async ({ conversationId, userId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation || !conversation.participants.includes(userId)) {
          throw new Error("Invalid conversation or sender");
        }

        const receiverId = conversation.participants.find(
          (participant) => participant !== userId
        );

        if (!receiverId) {
          throw new Error("Receiver ID not found in the conversation");
        }

        const receiverUser = await User.findById(receiverId);

        if (receiverUser && receiverUser.socketId) {
          socket
            .to(receiverUser.socketId)
            .emit("typing", { conversationId, isTyping: true });
        }
      } catch (error) {
        console.log("Error handling typing event:", error);
      }
    });

    socket.on("stopTyping", async ({ conversationId, userId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation || !conversation.participants.includes(userId)) {
          throw new Error("Invalid conversation or sender");
        }

        const receiverId = conversation.participants.find(
          (participant) => participant !== userId
        );

        if (!receiverId) {
          throw new Error("Receiver ID not found in the conversation");
        }

        const receiverUser = await User.findById(receiverId);

        if (receiverUser && receiverUser.socketId) {
          socket
            .to(receiverUser.socketId)
            .emit("typing", { conversationId, isTyping: false });
        }
      } catch (error) {
        console.log("Error handling stop typing event:", error);
      }
    });

    socket.on("logout", async () => {
      try {
        // Unset user's Socket ID in the database
        const user = await User.findOneAndUpdate(
          { socketId: socket.id },
          { $unset: { socketId: 1 } }
        );
        if (user) {
          console.log(`User ${user.username} (ID: ${user._id}) logged out.`);
        } else {
          console.log("User not found. logout");
        }
      } catch (error) {
        console.error("Error updating user socket ID:", error);
      }
    });

    // Handle disconnect event
    socket.on("disconnect", async () => {
      console.log(`Client ${socket.id} disconnected`);
      try {
        // Unset user's Socket ID in the database
        const user = await User.findOneAndUpdate(
          { socketId: socket.id },
          { $unset: { socketId: 1 } }
        );
        if (user) {
          console.log(`User ${user.username} (ID: ${user._id}) disconnected.`);
        } else {
          console.log("User not found. disconnect");
        }
      } catch (error) {
        console.error("Error updating user socket ID:", error);
      }
    });
  });
};

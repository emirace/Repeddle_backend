import { Server } from 'socket.io';
import User from '../model/user';

export const defaultSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected to all namespace: ${socket.id}`);

    // Capture Socket ID and associate it with user ID
    socket.on('login', async (userId) => {
      // Update or create user's Socket ID in the database
      await User.findOneAndUpdate(
        { _id: userId },
        { socketId: socket.id },
        { upsert: true }
      );
    });

    // Handle disconnect event
    socket.on('disconnect', async () => {
      console.log('A user disconnected');
      // Remove user's Socket ID from the database on disconnect
      await User.updateOne(
        { socketId: socket.id },
        { $unset: { socketId: 1 } }
      );
    });

    socket.on('disconnect', () => {
      console.log(`Client ${socket.id} disconnected`);
    });
  });
};

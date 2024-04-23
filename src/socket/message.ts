import { Server, Socket } from 'socket.io';

export const configureMessageSocket = (io: Server): void => {
  const messageNamespace = io.of('/message');

  messageNamespace.on('connection', (socket: Socket) => {
    console.log(`Socket connected to message namespace: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client ${socket.id} disconnected`);
    });
    // Handle message socket events here
  });
};

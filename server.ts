import { Server } from 'socket.io';
import { createServer } from 'http';
import type { ChatMessage, AIConversation } from './types';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"]
  }
});

// Store active rooms and their users
const rooms = new Map<string, Set<string>>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinRoom', (roomId: string) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId)?.add(socket.id);
    
    // Notify room of updated user list
    const users = Array.from(rooms.get(roomId) || []);
    io.to(roomId).emit('userListUpdate', users);
    
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leaveRoom', (roomId: string) => {
    socket.leave(roomId);
    rooms.get(roomId)?.delete(socket.id);
    
    // Notify room of updated user list
    const users = Array.from(rooms.get(roomId) || []);
    io.to(roomId).emit('userListUpdate', users);
    
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('chatMessage', (message: Partial<ChatMessage>) => {
    if (message.roomId) {
      io.to(message.roomId).emit('newMessage', message);
    }
  });

  socket.on('aiResponseShared', (conversation: AIConversation) => {
    if (conversation.repoFullName) {
      io.to(conversation.repoFullName).emit('sharedAIResponse', conversation);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove user from all rooms they were in
    rooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        const remainingUsers = Array.from(users);
        io.to(roomId).emit('userListUpdate', remainingUsers);
      }
    });
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 
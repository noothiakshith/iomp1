import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import type { ChatMessage, AIConversation, CodeSnippet, CodeAnalysis } from './types';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store active users and their typing status
const activeUsers = new Map<string, { roomId: string; isTyping: boolean }>();

// Simple code analysis function (you can replace this with a more sophisticated analysis)
const analyzeCode = (code: string, language: string): CodeAnalysis => {
  const lines = code.split('\n');
  const complexity = Math.min(lines.length / 10, 5); // Simple complexity based on lines
  
  const issues: string[] = [];
  const improvements: string[] = [];
  
  // Basic code analysis
  if (lines.length > 50) {
    issues.push('Code is quite long. Consider breaking it into smaller functions.');
  }
  
  if (code.includes('any')) {
    issues.push('Usage of "any" type detected. Consider using more specific types.');
  }
  
  if (code.includes('console.log')) {
    issues.push('Debug logs found in code. Consider removing them before production.');
  }
  
  if (code.includes('setTimeout') || code.includes('setInterval')) {
    improvements.push('Consider using async/await instead of callbacks for better readability.');
  }
  
  if (code.includes('var ')) {
    improvements.push('Consider using "let" or "const" instead of "var" for better scoping.');
  }
  
  return {
    suggestions: [
      'Add error handling',
      'Include input validation',
      'Add documentation'
    ],
    complexity,
    issues,
    improvements,
    explanation: `This code has a complexity score of ${complexity.toFixed(1)}/5. ${
      issues.length > 0 ? 'There are some issues that need attention.' : 'The code looks generally well-structured.'
    } ${
      improvements.length > 0 ? 'Consider implementing the suggested improvements.' : ''
    }`
  };
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_room', (roomId: string) => {
    console.log(`User ${socket.id} attempting to join room ${roomId}`);
    socket.join(roomId);
    activeUsers.set(socket.id, { roomId, isTyping: false });
    console.log(`User ${socket.id} successfully joined room ${roomId}`);
    io.to(roomId).emit('user_joined', { userId: socket.id, roomId });
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
    activeUsers.delete(socket.id);
    io.to(roomId).emit('user_left', { userId: socket.id, roomId });
  });

  socket.on('chat_message', (message: ChatMessage) => {
    console.log('Received chat message:', message);
    const userData = activeUsers.get(socket.id);
    if (userData) {
      const broadcastMessage = {
        ...message,
        id: socket.id + Date.now(),
        timestamp: Date.now()
      };
      console.log('Broadcasting message to room:', userData.roomId, broadcastMessage);
      io.to(userData.roomId).emit('chat_message', broadcastMessage);
    } else {
      console.error('Message received from user not in any room:', socket.id);
    }
  });

  socket.on('typing_start', () => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      userData.isTyping = true;
      io.to(userData.roomId).emit('user_typing', { userId: socket.id });
    }
  });

  socket.on('typing_stop', () => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      userData.isTyping = false;
      io.to(userData.roomId).emit('user_stopped_typing', { userId: socket.id });
    }
  });

  socket.on('add_reaction', ({ messageId, reaction }: { messageId: string; reaction: string }) => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      io.to(userData.roomId).emit('reaction_added', {
        messageId,
        reaction,
        userId: socket.id
      });
    }
  });

  socket.on('remove_reaction', ({ messageId, reaction }: { messageId: string; reaction: string }) => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      io.to(userData.roomId).emit('reaction_removed', {
        messageId,
        reaction,
        userId: socket.id
      });
    }
  });

  socket.on('add_code_snippet', ({ messageId, codeSnippet }: { messageId: string; codeSnippet: CodeSnippet }) => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      io.to(userData.roomId).emit('code_snippet_added', {
        messageId,
        codeSnippet,
        userId: socket.id
      });
    }
  });

  socket.on('analyze_code', ({ messageId, code, language }: { messageId: string; code: string; language: string }) => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      const analysis = analyzeCode(code, language);
      io.to(userData.roomId).emit('code_analysis', {
        messageId,
        analysis,
        userId: socket.id
      });
    }
  });

  socket.on('reply_to_message', ({ parentMessageId, message }: { parentMessageId: string; message: ChatMessage }) => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      const replyMessage = {
        ...message,
        id: socket.id + Date.now(),
        timestamp: Date.now(),
        parentMessageId
      };
      io.to(userData.roomId).emit('chat_message', replyMessage);
      io.to(userData.roomId).emit('thread_updated', { messageId: parentMessageId, threadCount: 1 });
    }
  });

  socket.on('edit_message', ({ messageId, newText }: { messageId: string; newText: string }) => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      io.to(userData.roomId).emit('message_edited', {
        messageId,
        newText,
        editedAt: Date.now()
      });
    }
  });

  socket.on('upload_attachment', ({ messageId, attachment }: { 
    messageId: string; 
    attachment: { 
      type: 'image' | 'file' | 'link';
      url: string;
      name: string;
      size?: number;
    }
  }) => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      io.to(userData.roomId).emit('attachment_added', {
        messageId,
        attachment
      });
    }
  });

  socket.on('mention_user', ({ messageId, mentionedUser }: { messageId: string; mentionedUser: string }) => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      io.to(userData.roomId).emit('user_mentioned', {
        messageId,
        mentionedUser,
        mentionedBy: socket.id
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnecting:', socket.id);
    const userData = activeUsers.get(socket.id);
    if (userData) {
      console.log(`User ${socket.id} leaving room ${userData.roomId}`);
      io.to(userData.roomId).emit('user_left', { userId: socket.id, roomId: userData.roomId });
      activeUsers.delete(socket.id);
    }
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 
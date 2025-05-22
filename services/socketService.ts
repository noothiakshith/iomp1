import { io, Socket } from 'socket.io-client';
import type { ChatMessage, AIConversation } from '../types';
import { SOCKET_SERVER_URL } from '../constants';

let socket: Socket | null = null;

export const socketService = {
  connect: (
    onConnectCallback: () => void,
    onDisconnectCallback: (reason: Socket.DisconnectReason) => void,
    onConnectErrorCallback: (error: Error) => void
  ): Socket | null => {
    if (!socket) { // If no socket instance exists, create one
      console.log(`[SocketService] Creating new socket instance and attempting to connect to: ${SOCKET_SERVER_URL}`);
      socket = io(SOCKET_SERVER_URL, {
        reconnectionAttempts: 3,
        timeout: 10000,
        transports: ['websocket'],
        // autoConnect: true, // Default behavior of io()
      });
    }

    // Always remove previous core listeners before attaching new ones.
    // This handles re-calling connect (e.g., on App remount) with new callbacks for the same socket instance.
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');

    // Attach the new set of callbacks
    socket.on('connect', () => {
      console.log('[SocketService] Connected to server. Socket ID:', socket?.id);
      onConnectCallback();
    });

    socket.on('disconnect', (reason: Socket.DisconnectReason) => {
      console.warn('[SocketService] Disconnected from server:', reason);
      onDisconnectCallback(reason);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('[SocketService] Connection error object:', error); // Log the full error object
      onConnectErrorCallback(error);
    });

    // If the socket isn't already connected and isn't actively trying to connect,
    // explicitly tell it to. io() with autoConnect=true (default) usually handles
    // initial connection, but if socket.active is false (e.g., after a manual disconnect()
    // that didn't nullify the socket, or if autoConnect was somehow false initially),
    // this ensures an attempt is made.
    if (!socket.active) { // .active is true if connecting or connected
        console.log('[SocketService] Socket is not active, calling connect().');
        socket.connect();
    }
    
    return socket;
  },

  disconnect: () => {
    if (socket) {
      console.log('[SocketService] Disconnecting from server...');
      socket.disconnect();
      // We don't nullify `socket` here to allow its internal reconnection logic (if any still pending)
      // or to reuse the instance if `connect` is called again.
      // `connect` will re-attach listeners and call `socket.connect()` if needed.
    }
  },

  joinRoom: (roomId: string) => {
    if (socket && socket.connected) {
      socket.emit('joinRoom', roomId);
      console.log(`[SocketService] Emitted joinRoom for: ${roomId}`);
    } else {
      console.warn('[SocketService] Cannot join room, socket not connected.');
    }
  },

  leaveRoom: (roomId: string) => {
    if (socket && socket.connected) {
      socket.emit('leaveRoom', roomId);
      console.log(`[SocketService] Emitted leaveRoom for: ${roomId}`);
    }
  },

  sendMessage: (roomId: string, text: string) => {
    if (socket && socket.connected) {
      const messagePayload: Partial<ChatMessage> = {
        text,
        timestamp: Date.now(),
        roomId,
      };
      socket.emit('chatMessage', messagePayload);
      console.log(`[SocketService] Emitted chatMessage to room ${roomId}:`, text);
    } else {
      console.warn('[SocketService] Cannot send message, socket not connected.');
    }
  },

  sendAIResponseShared: (roomId: string, aiConversation: AIConversation) => {
    if (socket && socket.connected) {
      const payload = { ...aiConversation, user: aiConversation.user, roomId };
      socket.emit('aiResponseShared', payload);
      console.log(`[SocketService] Emitted aiResponseShared to room ${roomId}: Q: ${aiConversation.question}`);
    } else {
      console.warn('[SocketService] Cannot send AI response, socket not connected.');
    }
  },
  
  onNewMessage: (callback: (message: ChatMessage) => void) => {
    // Remove specific callback before adding to prevent duplicates if called multiple times with the same callback ref
    socket?.off('newMessage', callback); 
    socket?.on('newMessage', callback);
  },

  offNewMessage: (callback: (message: ChatMessage) => void) => {
    socket?.off('newMessage', callback);
  },

  onAIResponseShared: (callback: (conversation: AIConversation) => void) => {
    socket?.off('sharedAIResponse', callback);
    socket?.on('sharedAIResponse', callback); 
  },
  
  offAIResponseShared: (callback: (conversation: AIConversation) => void) => {
    socket?.off('sharedAIResponse', callback);
  },

  onUserListUpdate: (callback: (users: string[]) => void) => {
    socket?.off('userListUpdate', callback);
    socket?.on('userListUpdate', callback);
  },

  offUserListUpdate: (callback: (users: string[]) => void) => {
    socket?.off('userListUpdate', callback);
  },

  getSocket: (): Socket | null => socket,
};
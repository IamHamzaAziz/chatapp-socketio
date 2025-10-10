import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import Message from './models/Message';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Store online users: { userId: socketId }
const onlineUsers = new Map<string, string>();

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; username: string };
    socket.data.userId = decoded.userId;
    socket.data.username = decoded.username;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  const userId = socket.data.userId;
  const username = socket.data.username;

  console.log(`✅ User connected: ${username} (${userId})`);

  // Add user to online users
  onlineUsers.set(userId, socket.id);

  // Notify all clients about online users
  io.emit('online-users', Array.from(onlineUsers.keys()));

  // Handle private messages
  socket.on('send-private-message', async (data: { receiverId: string; receiverUsername: string; text: string }) => {
    try {
      const message = new Message({
        sender: userId,
        senderUsername: username,
        receiver: data.receiverId,
        receiverUsername: data.receiverUsername,
        text: data.text
      });

      await message.save();

      const messageData = {
        _id: message._id,
        sender: message.sender,
        senderUsername: message.senderUsername,
        receiver: message.receiver,
        receiverUsername: message.receiverUsername,
        text: message.text,
        createdAt: message.createdAt
      };

      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive-private-message', messageData);
      }

      // Send back to sender
      socket.emit('receive-private-message', messageData);

    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', {
        userId: userId,
        username: username,
        isTyping: data.isTyping
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${username}`);
    onlineUsers.delete(userId);
    
    // Notify all clients about online users
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Starting server script...');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function startServer() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

startServer();

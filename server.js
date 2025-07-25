// server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIO } from 'socket.io';
import dotenv from 'dotenv';

import { User, Keyword, Gameplay } from './models.js';
import { setupSocket } from './socket.js';

dotenv.config();
const app = express();
const { urlencoded, json } = bodyParser;

const mongo_uri = process.env.MONGO_URI || "mongodb://localhost:27017/fallback";
mongoose.connect(mongo_uri, { useNewUrlParser: true })
  .then(() => console.log('[MongoDB] Connected'))
  .catch(err => {
    console.error('[MongoDB] Connection error:', err);
    process.exit(1);
  });

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

// Your existing REST API endpoints (e.g. /users, /keywords, /api routes)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// ... Add the rest of your API routes here (copy from your original code)

// --- WebSocket Setup ---
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
});
setupSocket(io);

// --- Fallback route ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});

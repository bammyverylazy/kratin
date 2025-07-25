import mongoose from 'mongoose';
import { Gameplay } from './models.js';
const rooms = {};
const players = {};

export function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('[Socket] Connected:', socket.id);

    // Create a new room
    socket.on('createRoom', (roomCode) => {
      if (!rooms[roomCode]) {
        rooms[roomCode] = {
          host: socket.id,
          guessers: [],
          hinters: [],
          started: false,
          score: 0,
        };
        players[socket.id] = { room: roomCode, role: null, name: null };
        socket.join(roomCode);
        console.log(`[Room] Created: ${roomCode}`);
      }
    });

    // Join an existing room
    socket.on('joinRoom', (roomCode) => {
      if (!rooms[roomCode]) {
        socket.emit('roomJoinError', 'Room does not exist.');
        return;
      }
      if (rooms[roomCode].started) {
        socket.emit('roomJoinError', 'Game already started.');
        return;
      }
      players[socket.id] = { room: roomCode, role: null, name: null };
      socket.join(roomCode);
      socket.to(roomCode).emit('playerJoined', socket.id);
      console.log(`[Room] Joined: ${roomCode}`);
    });

    // Set player role (guesser or hinter)
    socket.on('setRole', (role) => {
      const player = players[socket.id];
      if (!player) return;

      const room = rooms[player.room];
      if (!room || room.started || player.role) return;

      player.role = role;
      if (role === 'guesser' && !room.guessers.includes(socket.id)) {
        room.guessers.push(socket.id);
      }
      if (role === 'hinter' && !room.hinters.includes(socket.id)) {
        room.hinters.push(socket.id);
      }

      io.to(player.room).emit('roleUpdate', {
        guessers: room.guessers,
        hinters: room.hinters,
      });

      console.log(`[Socket] Role set: ${role} (${socket.id})`);
    });

    // Start the game in a room
    socket.on('startGame', async ({ roomCode }) => {
      const room = rooms[roomCode];
      if (!room || room.started) return;

      room.started = true;
      room.score = 0;

      // Initialize gameplay in DB
      try {
        await Gameplay.deleteMany({ roomCode }); // clear previous game data
        const gameplay = new Gameplay({
          roomCode,
          hinter: room.hinters.map(id => ({ _id: id, name: players[id]?.name || 'Hinter' })),
          guesser: room.guessers.map(id => ({ _id: id, name: players[id]?.name || 'Guesser' })),
          mistakes: [],
          score: 0,
        });
        await gameplay.save();
      } catch (err) {
        console.error('[DB] Gameplay init failed:', err);
      }

      io.to(roomCode).emit('gameStarted', { startTime: Date.now() });
      console.log(`[Room] Game started: ${roomCode}`);
    });

    // Broadcast keyword and hint
    socket.on('keyword', ({ roomCode, keyword, hint }) => {
      io.to(roomCode).emit('keyword', { keyword, hint });
    });

    // Update score and mistakes
    socket.on('scoreUpdate', async ({ roomCode, result, keyword }) => {
      const room = rooms[roomCode];
      if (!room) return;

      if (!room.score) room.score = 0;
      if (result === 'TT') room.score += 2;
      else if (result === 'FT') room.score += 1;

      try {
        const gameplay = await Gameplay.findOne({ roomCode });
        if (gameplay) {
          gameplay.mistakes.push(`${result}:${keyword}`);
          gameplay.score = room.score;
          await gameplay.save();
        }
      } catch (err) {
        console.error('[Socket] Failed to update DB score:', err);
      }

      io.to(roomCode).emit('scoreUpdate', { score: room.score });
      console.log(`[Socket] Score updated for room ${roomCode}: ${room.score}`);
    });

    // Player quit / leave room
    socket.on('playerQuit', ({ roomCode }) => {
      const player = players[socket.id];
      const room = rooms[roomCode];
      if (!player || !room) return;

      const { role } = player;
      if (role && room[role + 's']) {
        room[role + 's'] = room[role + 's'].filter(id => id !== socket.id);
      }

      io.to(roomCode).emit('playerLeft', {
        userId: socket.id,
        role,
        name: player.name || `Player-${socket.id.slice(0, 4)}`,
      });

      delete players[socket.id];
      socket.leave(roomCode);

      console.log(`[Socket] Player quit: ${socket.id} from room ${roomCode}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const player = players[socket.id];
      if (!player) return;

      const roomCode = player.room;
      const role = player.role;

      if (rooms[roomCode]) {
        if (role && rooms[roomCode][role + 's']) {
          rooms[roomCode][role + 's'] = rooms[roomCode][role + 's'].filter(id => id !== socket.id);
        }
        io.to(roomCode).emit('playerLeft', {
          userId: socket.id,
          role,
          name: player.name || `Player-${socket.id.slice(0, 4)}`,
        });
      }

      delete players[socket.id];
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}export { Gameplay };

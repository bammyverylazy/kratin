// test-socket.js
import { io } from 'socket.io-client';

const socket = io('https://cellvivor-backend.onrender.com');

socket.on('connect', () => {
  console.log('[Tester] Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('[Tester] Disconnected');
});

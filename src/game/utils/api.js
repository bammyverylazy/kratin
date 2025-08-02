// src/utils/api.js
const backendURL = 'https://cellvivor-backend.onrender.com';

export async function saveProgress(userId, scene) {
  if (!userId || !scene) throw new Error("Missing userId or scene");
  const res = await fetch(`${backendURL}/progress/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, scene }),
  });
  if (!res.ok) throw new Error('Failed to save progress');
  return true;
}

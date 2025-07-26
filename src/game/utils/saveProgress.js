const backendURL = import.meta.env.VITE_BACKEND_URL;

// src/utils/saveProgress.js
export async function saveGameProgress(userId, currentChapter) {
  if (!userId || !currentChapter || currentChapter.trim() === '') {
    console.warn('saveGameProgress: Missing or invalid userId or currentChapter');
    return;
  }
  try {
    const res = await fetch(`${backendURL}progress/save`, {  // Adjust URL if needed
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, scene: currentChapter }),
    });
    if (!res.ok) {
      console.warn('Failed to save progress:', res.statusText);
    } else {
      console.log('Game progress saved:', currentChapter);
    }
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

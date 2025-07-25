# 🧬 Cellvivor – Educational Biology Game

Cellvivor is a multiplayer, browser-based educational game built with React, Phaser, and Socket.IO. It teaches human biology through interactive drag-and-drop classification games in both solo and multiplayer formats.

## 🎮 Game Overview

Cellvivor blends arcade-style mechanics with classroom-grade biology content. Players take on the role of a "cell hero" navigating human body systems like the circulatory system. Each level is a gamified challenge designed to test and reinforce biological concepts.

Key tasks include:
- Matching vessel characteristics (e.g., “thick walls”, “valves”) to Arteries, Veins, or Capillaries.
- Drag-and-drop property classification.
- Receiving instant feedback with retry options and next stage transitions.

## 🔗 Multiplayer Mode (Detailed)

Multiplayer mode transforms Cellvivor into a real-time competitive/cooperative challenge.

### Features:
- Real-time interaction using Socket.IO.
- Synchronized game board across multiple clients.
- Players race to correctly classify biological traits.
- Server tracks actions and determines winner.
- Replay/reset feature included.
- Ideal for classroom exercises or online science competitions.

### Socket.IO Events Used:
- boxDropped
- boxMoved
- playerFinished
- resetGame
- joinRoom
- startGame
- disconnect

## 🧪 Technologies Used

| Layer       | Technology        |
|-------------|-------------------|
| Frontend    | React (via Vite)  |
| Game Engine | Phaser.js         |
| Realtime    | Socket.IO         |
| Backend     | Node.js           |
| Styling     | CSS               |
| Server      | Express.js (implied) |
| Testing     | HTML socket test page |

## 📂 Project Structure

```
CELLVIVOR/
├── assets/                        # Game media assets
├── database/                     # DB helpers or config
├── game/                         # Core game logic (e.g., Chapter1game.js)
├── model/                        # Backend model definitions
│   └── model.js
├── node_modules/                 
├── public/
│   ├── assets/
│   ├── favicon.png
│   ├── style.css
│   └── test-socket.html
├── src/
│   ├── database/
│   ├── game/                     # Phaser game integration
│   ├── model/
│   ├── App.jsx
│   ├── Login.jsx
│   ├── Signin.jsx
│   ├── main.jsx
│   ├── PhaserGame.jsx
│   └── socket.js                 # Socket.IO client logic
├── index.html                    
├── log.js                        
├── package.json                 
├── server.js                     # Node + Socket.IO server
├── socket.js                     # Server-side socket handling
└── README.md
```

## 🚀 Running the Game

To install and start the game locally:

```bash
npm install
npm run dev      # for client via Vite
node server.js   # start multiplayer server
```

Visit http://localhost:5173 to play.

## 🧠 Educational Objectives

- Teach anatomy and cellular biology through interaction.
- Promote strategic thinking via classification challenges.
- Use repetition, feedback, and competition for retention.

## 🛠 Future Enhancements

- Add sound effects for feedback
- Mobile-responsive design
- Leaderboards and scoring
- MongoDB integration for persistent user data

## 👩‍🏫 Built For

- Biology educators
- STEM students (grade 8-12)
- EdTech platforms

---

© 2025 CELLVIVOR Team

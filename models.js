// models.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  progress: { type: Number, default: 0 },
  gameprogress: { type: String, default: "Chapter1" },
  weakness: { type: Array, default: [] },
});
const User = mongoose.models.Users || mongoose.model('Users', userSchema);

const keywordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  hint: { type: String },
  level: { type: String },
  category: { type: String },
  chapter: { type: String },
});
const Keyword = mongoose.models.Keywords || mongoose.model('Keywords', keywordSchema);

const gameplaySchema = new mongoose.Schema({
  roomCode: { type: String, required: true },
  hinter: [{ _id: String, name: String }],
  guesser: [{ _id: String, name: String }],
  mistakes: { type: [String], required: true },
  score: { type: Number, required: true },
  resultsPerPlayer: [{
    userId: String,
    role: { type: String, enum: ['hinter', 'guesser'] },
    keyword: String,
    result: { type: String, enum: ['TT', 'FT', 'FF'] },
    usedHint: Boolean,
    chapter: String,
    difficulty: String,
    timestamp: { type: Date, default: Date.now }
  }]
});
const Gameplay = mongoose.models.Gameplay || mongoose.model('Gameplay', gameplaySchema);

export { User, Keyword, Gameplay };

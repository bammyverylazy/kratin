import * as tf from '@tensorflow/tfjs';

let model = null;

export async function getNextKeywordAI(lastResult = { result: 'FT', difficulty: 'easy', chapter: '1' }) {
  if (!model) {
    model = await tf.loadLayersModel('/model_tfjs/model.json');
  }

  const difficultyMap = { easy: 0, medium: 1, hard: 2 };
  const resultMap = { TT: 2, FT: 1, FF: 0 };

  const inputTensor = tf.tensor2d([
    [resultMap[lastResult.result], difficultyMap[lastResult.difficulty], parseInt(lastResult.chapter)]
  ]);

  const prediction = model.predict(inputTensor);
  const predictedIndex = prediction.argMax(-1).dataSync()[0];
  const difficultyLabel = Object.keys(difficultyMap).find(key => difficultyMap[key] === predictedIndex);

  // ส่งไป backend เพื่อสุ่มคำจาก difficulty นั้น
  const response = await fetch(`https://cellvivor-backend.onrender.com/api/next-keyword?difficulty=${difficultyLabel}`);
  const data = await response.json();

  return data;  // { keyword: ..., hint: ... }
}

// aiHelper.js
import * as tf from '@tensorflow/tfjs';

let model;

export async function loadModel() {
  if (!model) {
    model = await tf.loadLayersModel('/model_tfjs/model.json'); // ต้องวาง model_tfjs ใน public/
  }
  return model;
}

export async function getNextKeywordAI(userLastResult) {
  const model = await loadModel();

  // ตัวอย่าง input: [usedHint, correct (TT=2, FT=1, FF=0), round]
  const input = tf.tensor2d([userLastResult]);  // [ [1, 2, 3] ]

  const prediction = model.predict(input);
  const predictionArray = await prediction.data();

  // ดึง index ที่ค่ามากสุด -> 0 = easy, 1 = medium, 2 = hard
  const difficultyIndex = predictionArray.indexOf(Math.max(...predictionArray));
  const difficultyMap = ['easy', 'medium', 'hard'];
  return difficultyMap[difficultyIndex];
}

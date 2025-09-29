// src/game/main.js
import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Mode } from './scenes/Mode';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { Chapter1 } from './scenes/Chapter1';
import { Chapter2 } from './scenes/Chapter2';
import { Chapter1game } from './scenes/Chapter1game.js';
import { Chapter2game } from './scenes/Chapter2game.js'; 
import { Chapter3 } from './scenes/Chapter3.js'; 
import { Chapter3game } from './scenes/Chapter3game.js';
import { Chapter4 } from './scenes/Chapter4.js';
import { Chapter4game } from './scenes/Chapter4game.js';
//import { EndingScene } from './scenes/EndingScene.js';
import { Dashboard } from './scenes/Dashboard.js';


const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#84A671',
    scene: [
        Boot,        // Only Boot is started automatically
        Preloader,   // Boot will start Preloader
        MainMenu,    // Preloader will start MainMenu
        Mode,
        Game,
        GameOver,
        Chapter1,
        Chapter2,
        Chapter1game,
        Chapter2game,
        Chapter3,
        Chapter3game,
        Chapter4, 
        Chapter4game,
        //EndingScene
        Dashboard
    ],
      physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;

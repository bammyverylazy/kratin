import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    // init ()
    // {
    // }

    preload ()
    {

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // progress bar UI
        const progressBox = this.add.graphics();
        const progressBar = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
        fontSize: '24px',
        color: '#ffffff'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        });

        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('star', 'star.png');
        this.load.image('logo', 'logo.png');
        this.load.image('storymode', 'storymode.png');
        this.load.image('multimode', 'multimode.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Storyboard extends Scene
{
    constructor ()
    {
        super('Storyboard');
    }

    create ()
    {
      //
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene {
    logoTween;

    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image('magnifying', 'assets/magnifying.png');
        this.load.image('5.png', 'assets/5.png');
        this.load.image('6.png', 'assets/6.png');
        this.load.image('7.png', 'assets/7.png');
        this.load.image('8.png', 'assets/8.png');
        this.load.image('9.png', 'assets/9.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#91e3ff');
        this.logo = this.add.image(this.cameras.main.centerX, 300, 'logo').setDepth(100).setScale(0.4);

        // Load current user
        let currentUser = null;
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) {
            currentUser = null;
        }

        if (currentUser && currentUser.name) {
            this.add.text(30, this.cameras.main.height - 50, `Welcome, ${currentUser.name}!`, {
                fontSize: '25px',
                color: '#000000ff',
                align: 'left',
                fontStyle: 'bold',
                fontWeight: '600',
                strokeThickness: 0
            }).setOrigin(0, 1).setDepth(110);
        }

        // === Play Game button (centered top) ===
        if (currentUser && currentUser.name) {
            const bg = this.add.rectangle(this.cameras.main.centerX, 550, 260, 56, 0x6067FE, 1)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });
            bg.setStrokeStyle(2, 0x4BC6F0);

            const playText = this.add.text(this.cameras.main.centerX, 550, 'Play Game', {
                fontSize: '28px',
                color: '#ffffffff'
            }).setOrigin(0.5).setDepth(1).setInteractive({ useHandCursor: true });

            const startGame = () => this.scene.start('Mode'); ///
            bg.on('pointerdown', startGame);
            playText.on('pointerdown', startGame);

            bg.on('pointerover', () => bg.setFillStyle(0x4BC6F0));
            bg.on('pointerout', () => bg.setFillStyle(0x6067FE));
        }

        // === Auth buttons aligned horizontally at bottom-right ===
        const labels = ['Signin', 'Login', 'Logout'];
        const actions = [
            () => {
                EventBus.emit('show-signin');
                EventBus.once('signin-success', () => this.scene.start('Mode'));
            },
            () => {
                EventBus.emit('show-login');
                EventBus.once('login-success', () => this.scene.start('Mode'));
            },
            () => {
                localStorage.clear();
                this.scene.restart();
            }
        ];

        const baseY = this.cameras.main.height - 50;
        const startX = this.cameras.main.width - (labels.length * 120) -10;

        labels.forEach((label, i) => {
            const x = startX + i * 120;
            const text = this.add.text(x, baseY, label, {
                fontSize: '26px',
                color: '#000000ff',
                fontStyle: 'bold',
            }).setOrigin(0, 1).setInteractive({ useHandCursor: true });

            text.on('pointerdown', actions[i]);
        });

        // === Magnifying button ===
        const magnifyingBtn = this.add.image(this.cameras.main.width - 60, 80, 'magnifying')
            .setOrigin(0.5)
            .setScale(0.1)
            .setDepth(120)
            .setInteractive({ useHandCursor: true });

        magnifyingBtn.on('pointerdown', () => {
            if (this.popupContainer) return;

            this.popupContainer = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.69)
                .setOrigin(0.5).setDepth(199).setInteractive();

            const popupBox = this.add.rectangle(512, 370, 850, 550, 0xffffff, 1)
                .setOrigin(0.5).setDepth(200);

            const slides = ['5.png', '6.png', '7.png', '8.png', '9.png'];
            let current = 0;
            const popupDepth = 201;

            let slideImage = this.add.image(512, 370, slides[current])
                .setDisplaySize(850, 550).setDepth(popupDepth);

            const prevBtn = this.add.text(192, 680, 'Previous', {
                fontSize: '28px',
                color: '#fff'
            }).setOrigin(0.5).setDepth(popupDepth + 1).setInteractive({ useHandCursor: true });

            const nextBtn = this.add.text(832, 680, 'Next', {
                fontSize: '28px',
                color: '#fff'
            }).setOrigin(0.5).setDepth(popupDepth + 1).setInteractive({ useHandCursor: true });

            const closePopup = () => {
                this.popupContainer.destroy();
                popupBox.destroy();
                slideImage.destroy();
                prevBtn.destroy();
                nextBtn.destroy();
                this.popupContainer = null;
            };

            function updateSlide() {
                slideImage.setTexture(slides[current]);
                prevBtn.setAlpha(current === 0 ? 0.5 : 1);
                prevBtn.disableInteractive();
                nextBtn.setAlpha(current === slides.length - 1 ? 0.5 : 1);
                nextBtn.disableInteractive();
                if (current > 0) prevBtn.setInteractive({ useHandCursor: true });
                if (current < slides.length - 1) nextBtn.setInteractive({ useHandCursor: true });
            }

            prevBtn.on('pointerdown', () => {
                if (current > 0) {
                    current--;
                    updateSlide();
                }
            });

            nextBtn.on('pointerdown', () => {
                if (current < slides.length - 1) {
                    current++;
                    updateSlide();
                } else {
                    closePopup();
                }
            });

            updateSlide();

            this.popupContainer.on('pointerdown', (pointer) => {
                const bounds = popupBox.getBounds();
                if (
                    pointer.x < bounds.left ||
                    pointer.x > bounds.right ||
                    pointer.y < bounds.top ||
                    pointer.y > bounds.bottom
                ) {
                    closePopup();
                }
            });
        });

        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }
        this.scene.start('Game');
    }

    enterButtonHoverState() {
        this.clickButton.setStyle({ fill: '#ff0' });
    }

    enterButtonRestState() {
        this.clickButton.setStyle({ fill: '#0f0' });
    }

    moveLogo(reactCallback) {
        if (this.logoTween) {
            if (this.logoTween.isPlaying()) {
                this.logoTween.pause();
            } else {
                this.logoTween.play();
            }
        } else {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback) {
                        reactCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}

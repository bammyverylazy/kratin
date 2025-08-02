// UIscene.js
import { saveGameProgress } from '../utils/saveProgress.js';

export function addStoryModeUI(scene, options = {}) {
    let popupOverlay = null;
    let popupBox = null;
    let popupContent = null;
    let popupButtons = [];

    function closePopup() {
        if (popupOverlay) popupOverlay.destroy();
        if (popupBox) popupBox.destroy();
        if (popupContent) popupContent.destroy();
        popupButtons.forEach(btn => btn.destroy());
        popupOverlay = popupBox = popupContent = null;
        popupButtons = [];
    }

    function openPopup(contentFn, withButtons = false) {
        if (popupOverlay) return; // Only one popup at a time
        popupOverlay = scene.add.rectangle(512, 384, 1024, 768, 0x000000, 0.66)
            .setOrigin(0.5).setDepth(199)
            .setInteractive()
            .on('pointerdown', () => { if (!withButtons) closePopup(); });
        popupBox = scene.add.rectangle(512, 370, 850, 550, 0xffffff, 0.5)
            .setOrigin(0.5).setDepth(200);
        popupContent = contentFn ? contentFn(scene, popupBox) : null;
        popupBox.setInteractive().on('pointerdown', (pointer, localX, localY, event) => {
            if (event) event.stopPropagation();
        });
    }

    // Top-right UI icons
    const iconSpacing = 70;
    const startX = 820;
    const y = 90;
    [
        {
            key: 'book',
            x: startX,
            cb: () => openPopup(options.onBook || defaultBook)
        },
        {
            key: 'magnifying',
            x: startX + iconSpacing,
            cb: () => openPopup(options.onHowToPlay || defaultHowToPlay)
        },
        {
            key: 'setting',
            x: startX + iconSpacing * 2,
            cb: () => openPopup(options.onSettings || defaultSettings)
        },
    ].forEach(icon => {
        scene.add.image(icon.x, y, icon.key)
            .setOrigin(0.5)
            .setScale(0.1)
            .setDepth(120)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (popupOverlay) return;
                icon.cb();
            });
    });

    // Quit arrow button
    const arrow = scene.add.text(60, 90, '<', {
        fontSize: '48px',
        color: '#ffffffff',
        align: 'Left',
        borderRadius: 12
    }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

    arrow.on('pointerdown', async () => {
        if (popupOverlay) return;

        const confirmQuit = window.confirm('Do you want to quit the storyboard mode?');
        if (!confirmQuit) return;

        const userId = options.userId || scene.registry.get('userId');
        const currentChapter = options.currentChapter || scene.scene.key;

        try {
            if (userId && currentChapter) {
                await saveProgress(userId, currentChapter);
                console.log('✅ Progress saved on quit:', currentChapter);
            } else {
                console.warn('⚠️ Missing userId or currentChapter; progress not saved.');
            }
        } catch (err) {
            console.error('❌ Failed to save progress on quit:', err);
        }

        scene.scene.start('MainMenu');
        scene.scene.stop();
        scene.children.removeAll();
    });

    // Default popup content handlers
    function defaultHowToPlay(scene, box) {
        const slides = ['5.png', '6.png', '7.png', '8.png', '9.png'];
        let current = 0;
        const popupDepth = 201;

        let slideImage = scene.add.image(box.x, box.y, slides[current])
            .setDisplaySize(850, 550)
            .setDepth(popupDepth);

        const prevBtn = scene.add.text(box.x - 320, box.y + 300, 'Previous', {
            fontSize: '28px',
            color: '#fff',
            padding: { left: 20, right: 20, top: 10, bottom: -1 }
        }).setOrigin(0.5).setDepth(popupDepth + 1).setInteractive({ useHandCursor: true });

        const nextBtn = scene.add.text(box.x + 320, box.y + 300, 'Next', {
            fontSize: '28px',
            color: '#fff',
            padding: { left: 20, right: 20, top: 10, bottom: -1 }
        }).setOrigin(0.5).setDepth(popupDepth + 1).setInteractive({ useHandCursor: true });

        function updateSlide() {
            slideImage.setTexture(slides[current]);
            prevBtn.setAlpha(current === 0 ? 0.5 : 1).setInteractive(current > 0);
            nextBtn.setAlpha(current === slides.length - 1 ? 0.5 : 1).setInteractive(current < slides.length - 1);
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
            }
        });

        updateSlide();

        scene.events.once('shutdown', () => {
            slideImage.destroy();
            prevBtn.destroy();
            nextBtn.destroy();
        });

        return {
            destroy: () => {
                slideImage.destroy();
                prevBtn.destroy();
                nextBtn.destroy();
            }
        };
    }

   function defaultSettings(scene, box) {
    const label = scene.add.text(box.x - 120, box.y - 60, 'Sound:', {
        fontSize: '28px',
        color: '#222',
    }).setOrigin(0, 0.5).setDepth(201);

    const checkboxBg = scene.add.rectangle(box.x + 40, box.y - 60, 32, 32, 0xffffff)
        .setStrokeStyle(2, 0x888888)
        .setOrigin(0, 0.5)
        .setDepth(201)
        .setInteractive({ useHandCursor: true });

    const checkmark = scene.add.text(box.x + 46, box.y - 60, '✓', {
        fontSize: '28px',
        color: '#222',
    }).setOrigin(0, 0.5).setDepth(202);

    const soundEnabled = localStorage.getItem('soundEnabled');
    let isChecked = soundEnabled === null ? true : (soundEnabled === 'true');
    checkmark.setVisible(isChecked);

    const toggleSound = () => {
        isChecked = !isChecked;
        checkmark.setVisible(isChecked);
        localStorage.setItem('soundEnabled', isChecked);
        scene.sound.mute = !isChecked;
        if (scene.bgm) {
            isChecked ? scene.bgm.play() : scene.bgm.stop();
        }
    };

    checkboxBg.on('pointerdown', toggleSound);
    label.on('pointerdown', toggleSound);

    // 🔊 Volume Slider
    const volumeLabel = scene.add.text(box.x - 120, box.y + 20, 'Volume:', {
        fontSize: '28px',
        color: '#222'
    }).setOrigin(0, 0.5).setDepth(201);

    const sliderBg = scene.add.rectangle(box.x + 30, box.y + 20, 200, 10, 0xcccccc)
        .setOrigin(0, 0.5).setDepth(201);

    const savedVolume = parseFloat(localStorage.getItem('voiceVolume') || '1');
    const knobX = box.x + 30 + savedVolume * 200;

    const sliderKnob = scene.add.circle(knobX, box.y + 20, 12, 0x666666)
        .setDepth(202).setInteractive({ draggable: true });

    scene.input.setDraggable(sliderKnob);

    sliderKnob.on('drag', (pointer, dragX) => {
        const minX = box.x + 30;
        const maxX = box.x + 230;
        dragX = Phaser.Math.Clamp(dragX, minX, maxX);
        sliderKnob.x = dragX;

        const volume = Phaser.Math.Clamp((dragX - minX) / 200, 0, 1);
        localStorage.setItem('voiceVolume', volume.toFixed(2));
        if (scene.sound) scene.sound.volume = volume;
    });

    // Set initial volume globally
    if (scene.sound) scene.sound.volume = savedVolume;

    return {
        destroy: () => {
            label.destroy();
            checkboxBg.destroy();
            checkmark.destroy();
            volumeLabel.destroy();
            sliderBg.destroy();
            sliderKnob.destroy();
        }
    };
}

    function defaultBook(scene, box) {
    const pages = [
        "📖 Page 1:\nWelcome to your notebook!\n\nHere you can read story notes or clues.",
        "📖 Page 2:\nDid you know?\nRed blood cells carry oxygen.",
        "📖 Page 3:\nTip:\nPay attention to what each organ does in your journey!",
        "📖 Page 4:\nYou can customize each page\nwith helpful reminders or story points."
    ];
    let currentPage = 0;
    const popupDepth = 201;

    // Notebook background image
    const notebookImage = scene.add.image(box.x, box.y, 'notebook')
        .setDisplaySize(850, 550)
        .setDepth(popupDepth);

    // Text field
    const text = scene.add.text(box.x, box.y, pages[currentPage], {
        fontSize: '24px',
        color: '#222',
        align: 'center',
        wordWrap: { width: 700, useAdvancedWrap: true }
    }).setOrigin(0.5).setDepth(popupDepth + 1);

    // Page navigation buttons
    const prevBtn = scene.add.text(box.x - 300, box.y + 230, 'Previous', {
        fontSize: '24px',
        color: '#fff',
        backgroundColor: '#444',
        padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setDepth(popupDepth + 2).setInteractive({ useHandCursor: true });

    const nextBtn = scene.add.text(box.x + 300, box.y + 230, 'Next', {
        fontSize: '24px',
        color: '#fff',
        backgroundColor: '#444',
        padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setDepth(popupDepth + 2).setInteractive({ useHandCursor: true });

    function updatePage() {
        text.setText(pages[currentPage]);
        prevBtn.setAlpha(currentPage === 0 ? 0.5 : 1).setInteractive(currentPage > 0);
        nextBtn.setAlpha(currentPage === pages.length - 1 ? 0.5 : 1).setInteractive(currentPage < pages.length - 1);
    }

    prevBtn.on('pointerdown', () => {
        if (currentPage > 0) {
            currentPage--;
            updatePage();
        }
    });

    nextBtn.on('pointerdown', () => {
        if (currentPage < pages.length - 1) {
            currentPage++;
            updatePage();
        }
    });

    updatePage();

    // Cleanup on scene shutdown
    scene.events.once('shutdown', () => {
        notebookImage.destroy();
        text.destroy();
        prevBtn.destroy();
        nextBtn.destroy();
    });

    // Return destroyable group
    return {
        destroy: () => {
            notebookImage.destroy();
            text.destroy();
            prevBtn.destroy();
            nextBtn.destroy();
        }
    };
}

}

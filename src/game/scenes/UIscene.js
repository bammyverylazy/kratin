export function addStoryModeUI(scene, options = {}) {
    // Popup state
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

    // Top right icons
    const iconSpacing = 70;
    const startX = 820;
    const y = 90;
    [
                {
            key: 'book',
            x: startX  ,
            cb: () => openPopup(options.onBook || defaultBook)
        },
        {
            key: 'magnifying',
            x: startX + iconSpacing,
            cb: () => openPopup(options.onHowToPlay || defaultHowToPlay)
        },
        {
            key: 'setting',
            x: startX + iconSpacing*2,
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
    const arrow = scene.add.text(60, 90, '<', {
        fontSize: '48px',
        color: '#ffffffff',
        align: 'Left',
        borderRadius: 12
    }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

arrow.on('pointerdown', () => {
    if (popupOverlay) return;
    const confirmQuit = window.confirm('Do you want to quit the storyboard mode?');
    if (confirmQuit) {
        console.log('User chose to quit the game.');
        scene.scene.start('MainMenu'); // ✅ use passed scene reference
        scene.scene.stop();    
        scene.children.removeAll(); 
    } else {
        console.log('User chose to stay in the game.');
    }
});


      
    };

    // Default popup content functions
    function defaultHowToPlay(scene, box) {
        const slides = ['5.png', '6.png', '7.png', '8.png', '9.png'];
        let current = 0;
        const popupDepth = 201; // Slide and buttons should be above box (200)

        // Show the first slide
        let slideImage = scene.add.image(box.x, box.y, slides[current])
            .setDisplaySize(850, 550)
            .setDepth(popupDepth);

        // Previous button
        const prevBtn = scene.add.text(box.x - 320, box.y + 300, 'Previous', {
            fontSize: '28px',
            color: '#fff',
            //backgroundColor: '#007bff',
            padding: { left: 20, right: 20, top: 10, bottom: -1 }
        }).setOrigin(0.5).setDepth(popupDepth + 1).setInteractive({ useHandCursor: true });

        // Next button
        const nextBtn = scene.add.text(box.x + 320, box.y + 300, 'Next', {
            fontSize: '28px',
            color: '#fff',
            //backgroundColor: '#007bff',
            padding: { left: 20, right: 20, top: 10, bottom: -1 }
        }).setOrigin(0.5).setDepth(popupDepth + 1).setInteractive({ useHandCursor: true });

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
            }
        });

        updateSlide();

        // Clean up when popup closes
        scene.events.once('shutdown', () => {
            slideImage.destroy();
            prevBtn.destroy();
            nextBtn.destroy();
        });

        // No container, just return a dummy object for compatibility
        return { destroy: () => { slideImage.destroy(); prevBtn.destroy(); nextBtn.destroy(); } };
    }
    function defaultSettings(scene, box) {
  // Text label
  const label = scene.add.text(box.x - 120, box.y, 'Sound:', {
    fontSize: '28px',
    color: '#222',
  }).setOrigin(0, 0.5).setDepth(201);

  // Checkbox background
  const checkboxBg = scene.add.rectangle(box.x + 40, box.y, 32, 32, 0xffffff)
    .setStrokeStyle(2, 0x888888)
    .setOrigin(0, 0.5)
    .setDepth(201)
    .setInteractive({ useHandCursor: true });

  // Checkmark text (✓)
  const checkmark = scene.add.text(box.x + 46, box.y, '✓', {
    fontSize: '28px',
    color: '#222',
  }).setOrigin(0, 0.5).setDepth(202);

  // Initialize checkmark visibility based on localStorage
  const soundEnabled = localStorage.getItem('soundEnabled');
  let isChecked = soundEnabled === null ? true : (soundEnabled === 'true');
  checkmark.setVisible(isChecked);

  // Toggle function
  const toggleSound = () => {
    isChecked = !isChecked;
    checkmark.setVisible(isChecked);
    localStorage.setItem('soundEnabled', isChecked);

    // Update scene mute/unmute
    if (scene.sound) {
      scene.sound.mute = !isChecked;

      if (isChecked) {
        if (!scene.bgm.isPlaying) scene.bgm.play();
      } else {
        if (scene.bgm.isPlaying) scene.bgm.stop();
      }
    }
  };

  checkboxBg.on('pointerdown', toggleSound);
  label.on('pointerdown', toggleSound);

  // Return a container-like object for cleanup
  return {
    destroy: () => {
      label.destroy();
      checkboxBg.destroy();
      checkmark.destroy();
    }
  };
}



    function defaultBook(scene, box) {
        return scene.add.text(box.x, box.y, 'Book\n\nBook content goes here.', {
            fontSize: '32px',
            color: '#222',
            align: 'center',
            wordWrap: { width: 750 }
        }).setOrigin(0.5).setDepth(201);
    }


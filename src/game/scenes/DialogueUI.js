class DialogueUI {
  constructor(scene) {
    this.scene = scene;
    this.dialogueBox = null;
    this.text = null;
    this.speakerText = null;
    this.currentDialogue = [];
    this.currentLineIndex = 0;
    this.typing = false;
    this.choiceButtons = [];
    this.isDialogueActive = false;
    this.onLineComplete = null;
    this.typingInterval = null;

    // 🔒 Stop typing loop when scene shuts down
    this.scene.events.on('shutdown', () => this.destroyTypingInterval());
    this.scene.events.on('destroy', () => this.destroyTypingInterval());
  }

  destroyTypingInterval() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
  }

  createDialogueBox() {
    if (this.dialogueBox) this.dialogueBox.destroy();
    if (this.speakerText) this.speakerText.destroy();
    if (this.text) this.text.destroy();

    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillRect(50, this.scene.cameras.main.height - 150, this.scene.cameras.main.width - 100, 100);
    this.dialogueBox = graphics;

    this.speakerText = this.scene.add.text(60, this.scene.cameras.main.height - 145, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.text = this.scene.add.text(60, this.scene.cameras.main.height - 123, '', {
      fontSize: '16px',
      fill: '#ffffff',
      wordWrap: { width: this.scene.cameras.main.width - 120 }
    });
  }

  startDialogue(dialogueArray) {
    this.currentDialogue = dialogueArray;
    this.currentLineIndex = 0;
    this.isDialogueActive = true;
    this.createDialogueBox();
    this.showNextLine();
  }

  showLine(index) {
    if (this.speakerText) this.speakerText.setText('');
    if (this.text) this.text.setText('');

    const line = this.currentDialogue[index];
    if (!line) return;

    this.speakerText.setText(line.speaker);
    this.text.setText('');
    this.typing = true;
    this.currentLineIndex = index;

    this.typeText(line.text);
  }

  showNextLine() {
    if (this.currentLineIndex < this.currentDialogue.length) {
      this.showLine(this.currentLineIndex);
      this.currentLineIndex++;
    } else {
      this.endDialogue();
      if (typeof this.onLineComplete === 'function') {
        this.onLineComplete();
      }
    }
  }

  typeText(text) {
    let index = 0;
    this.destroyTypingInterval(); // clear previous interval

    this.typingInterval = setInterval(() => {
      // 💥 Guard against destroyed scene or text object
      if (!this.scene || !this.scene.scene || !this.scene.scene.isActive() || !this.text || !this.text.setText) {
        this.destroyTypingInterval();
        return;
      }

      if (index < text.length) {
        this.text.setText(this.text.text + text.charAt(index));
        index++;
      } else {
        this.destroyTypingInterval();
        this.typing = false;
        this.checkForChoices();
      }
    }, 50);
  }

  skipTyping() {
    if (!this.typing) return;

    this.destroyTypingInterval();
    const fullText = this.currentDialogue[this.currentLineIndex - 1]?.text || '';
    if (this.text && this.text.setText) {
      this.text.setText(fullText);
    }
    this.typing = false;
    this.checkForChoices();
  }

  advance() {
    if (this.typing) {
      this.skipTyping();
    } else {
      this.clearChoices();
      if (typeof this.onLineComplete === 'function') {
        this.onLineComplete();
      }
    }
  }

  goBack() {
    if (this.typing) {
      this.skipTyping();
      return;
    }

    if (this.currentLineIndex <= 1) return;

    this.currentLineIndex -= 2;
    if (this.currentLineIndex < 0) this.currentLineIndex = 0;

    this.clearChoices();
    this.showLine(this.currentLineIndex);
  }

  checkForChoices() {
    const currentLine = this.currentDialogue[this.currentLineIndex - 1];
    if (currentLine?.choices?.length > 0) {
      this.showChoices(currentLine.choices);
    }
  }

  showChoices(choices) {
    choices.forEach((choice, index) => {
      const button = this.scene.add.text(60, this.scene.cameras.main.height - 50 + index * 30, choice.text, {
        fontSize: '16px',
        fill: '#ffffff'
      }).setInteractive();

      button.on('pointerdown', () => {
        this.currentLineIndex = choice.nextId;
        this.clearChoices();
        this.showNextLine();
      });

      this.choiceButtons.push(button);
    });
  }

  clearChoices() {
    this.choiceButtons.forEach(button => button.destroy());
    this.choiceButtons = [];
  }

  nextLine() {
    if (!this.typing) {
      this.clearChoices();
      this.showNextLine();
    }
  }

  endDialogue() {
    this.destroyTypingInterval(); // ❗ Stop typing loop when dialogue ends
    if (this.dialogueBox) this.dialogueBox.destroy();
    if (this.speakerText) this.speakerText.destroy();
    if (this.text) this.text.destroy();
    this.isDialogueActive = false;
  }
}

export default DialogueUI;

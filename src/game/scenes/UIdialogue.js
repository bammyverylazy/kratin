class UIdialogue {
    constructor(scene) {
        this.scene = scene;
        this.dialogueUI = null;
    }

    preload() {
        // Load any assets needed for the dialogue UI here
    }

    create() {
        this.dialogueUI = new DialogueUI(this.scene);
    }

    startDialogue(dialogueArray) {
        this.dialogueUI.startDialogue(dialogueArray);
    }
}

export default UIdialogue;
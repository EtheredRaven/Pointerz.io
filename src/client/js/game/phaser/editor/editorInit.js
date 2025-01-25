module.exports = function (Client) {
  Client.phaser.editor.reset = function () {
    Client.phaser.editor.selectedBlock = undefined;
    Client.phaser.editor.previouslySelectedBlockList = [];
    Client.phaser.editor.copiedBlock = undefined;
    Client.phaser.editor.selectedHandle = undefined;
    Client.phaser.editor.placedBlock = undefined;
    Client.phaser.editor.indexOfDrawnComponentToAddBlock = undefined;
    Client.phaser.editor.currentTool = Client.phaser.editor.TOOLS.SELECT;
    Client.phaser.editor.scrollSpeedX = 0;
    Client.phaser.editor.scrollSpeedY = 0;

    Client.phaser.editor.setCircuitSavedState(true);

    Client.phaser.scene.cameras.main.setScroll(
      (Client.width + window.screen.width) / 2,
      (Client.height + window.screen.height) / 2
    );
    if (Client.editor.editedCircuit.blocks.length) {
      let firstBlockMidPoint =
        Client.editor.editedCircuit.blocks[0].getAveragePoint();

      Client.phaser.scene.cameras.main.setScroll(
        firstBlockMidPoint.x - window.screen.width / 2,
        firstBlockMidPoint.y - window.screen.height / 2
      );
    }
  };

  Client.phaser.editor.setCircuitSavedState = function (newSavedState) {
    Client.phaser.editor.saved = newSavedState;
    if (Client.svelte.updateCircuitSavedState)
      Client.svelte.updateCircuitSavedState();
  };
};

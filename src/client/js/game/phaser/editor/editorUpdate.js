module.exports = function (Client) {
  Client.phaser.editor.update = function () {
    Client.phaser.editor.performContinuousControls();

    if (Client.phaser.editor.placedBlock) {
      if (
        Client.phaser.editor.currentTool == Client.phaser.editor.TOOLS.PLACE
      ) {
        Client.phaser.moveBlockDrawers(Client.phaser.editor.placedBlock, {
          x: Client.phaser.phaserInstance.input.activePointer.worldX,
          y: Client.phaser.phaserInstance.input.activePointer.worldY,
        });
      } else if (
        Client.phaser.editor.currentTool == Client.phaser.editor.TOOLS.DRAW
      ) {
        Client.phaser.editor.updateDrawnBlockGraphics();
      }
    }

    if (
      Client.phaser.editor.currentTool == Client.phaser.editor.TOOLS.MODIFY &&
      Client.phaser.editor.selectedHandle
    ) {
      Client.phaser.editor.selectedHandle.action(
        Client.phaser.phaserInstance.input.activePointer.worldX,
        Client.phaser.phaserInstance.input.activePointer.worldY
      );
      Client.phaser.editor.setCircuitSavedState(false); // TODO : changer si on fait que echap annule l'action (mettre le unsvaed dans le clic)
      Client.phaser.editor.updateSelectedBlockGraphics();
    }
  };
};

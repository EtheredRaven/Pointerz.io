const Constants = require("../../logic/Constants");

module.exports = function (Client) {
  Client.phaser.editor.registerDiscreteControls = function () {
    Client.phaser.scene.input.keyboard.manager.preventDefault = false;
    Client.phaser.addControlKeyPress("editor", "UP", 100, () => {
      Client.phaser.editor.moveSelectedBlock(0, -Constants.gridSize);
    });

    Client.phaser.addControlKeyPress("editor", "DOWN", 100, () => {
      Client.phaser.editor.moveSelectedBlock(0, Constants.gridSize);
    });

    Client.phaser.addControlKeyPress("editor", "LEFT", 100, () => {
      Client.phaser.editor.moveSelectedBlock(-Constants.gridSize, 0);
    });

    Client.phaser.addControlKeyPress("editor", "RIGHT", 100, () => {
      Client.phaser.editor.moveSelectedBlock(Constants.gridSize, 0);
    });

    Client.phaser.addControlKeyPress("editor", "DELETE", 100, () => {
      Client.phaser.editor.deleteSelectedBlock();
    });

    Client.phaser.addControlKeyPress("editor", "ESC", 100, () => {
      Client.phaser.editor.deletePlacedBlock();
    });

    Client.phaser.addControlKeyPress("editor", "SHIFT", 200, () => {
      window.isSnapping = false;
    });

    Client.phaser.addControlKeyPress(
      "editor",
      "SHIFT",
      200,
      () => {
        window.isSnapping = true;
      },
      true
    );

    Client.phaser.scene.input.keyboard.on("keydown", (event) => {
      if (event.key == "c" && event.ctrlKey) {
        Client.phaser.editor.copySelectedBlock();
      } else if (event.key == "v" && event.ctrlKey) {
        Client.phaser.editor.pasteCopiedBlock();
      }
    });

    Client.phaser.scene.input.on("wheel", (pointer, dx, dy, dz, event) => {
      Client.phaser.isInEditorMode &&
        Client.phaser.editor.zoomOnCanvas(pointer, dz);
    });

    Client.phaser.scene.input.on("pointerup", function (pointer) {
      Client.phaser.isInEditorMode &&
        !Client.phaser.editor.isPerformingContinuousAction &&
        Client.phaser.editor.performClickAction(pointer);
    });
  };

  Client.phaser.editor.performContinuousControls = function () {
    Client.phaser.editor.moveCanvasOnMouseMove();
  };

  Client.phaser.editor.performClickAction = function (pointer) {
    if (Client.phaser.editor.currentTool == Client.phaser.editor.TOOLS.SELECT) {
      Client.phaser.editor.selectedBlock &&
      Client.phaser.editor.selectClickedHandleFromSelectedBlock(pointer)
        ? (Client.phaser.editor.currentTool = Client.phaser.editor.TOOLS.MODIFY)
        : Client.phaser.editor.selectClickedBlock(pointer);
    } else if (
      Client.phaser.editor.currentTool == Client.phaser.editor.TOOLS.PLACE
    ) {
      Client.phaser.editor.addPlacedBlockInCircuit();
    } else if (
      Client.phaser.editor.currentTool == Client.phaser.editor.TOOLS.DRAW
    ) {
      Client.phaser.editor.goToNextDrawStep(pointer);
    } else if (
      Client.phaser.editor.currentTool == Client.phaser.editor.TOOLS.MODIFY
    ) {
      Client.phaser.editor.currentTool = Client.phaser.editor.TOOLS.SELECT;
      Client.phaser.editor.selectedHandle = undefined;
    }
  };
};

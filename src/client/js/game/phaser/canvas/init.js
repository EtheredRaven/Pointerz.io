module.exports = function (Client) {
  Client.phaser.create = function () {
    // General settings
    Client.phaser.scene = this;
    this.renderer.clearBeforeRender = false;
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBounds(0, 0, Client.width, Client.height);
    this.cameras.main.setSize(window.innerWidth, window.innerHeight);
    this.cameras.main.zoom = Client.phaser.editor.DEFAULT_ZOOM;

    registerControls(this);
    initGlobalDrawers(this);
    drawBackground();
  };

  function registerControls(scene) {
    Client.phaser.race.registerDiscreteControls();
    Client.phaser.editor.registerDiscreteControls();
  }

  function initGlobalDrawers(scene) {
    Client.phaser.globalDrawers = {
      background: scene.add.graphics(),
      editorBlockBoundingBox: scene.add.graphics(),
      driftMarks: scene.add.graphics(),
      phantomsDriftMarks: scene.add.graphics(),
    };
    Client.phaser.globalDrawers.background.setDepth(
      Client.phaser.LAYERS_DEPTHS.BACKGROUND
    );
    Client.phaser.globalDrawers.editorBlockBoundingBox.setDepth(
      Client.phaser.LAYERS_DEPTHS.EDITOR_BLOCK_BOUNDING_BOX
    );
    Client.phaser.globalDrawers.driftMarks.setDepth(
      Client.phaser.LAYERS_DEPTHS.DRIFT_MARKS
    );
    Client.phaser.globalDrawers.phantomsDriftMarks.setDepth(
      Client.phaser.LAYERS_DEPTHS.DRIFT_MARKS
    );
  }

  function drawBackground() {
    Client.phaser.globalDrawers.background.fillStyle(
      Client.phaser.BACKGROUND_COLOR
    );
    Client.phaser.globalDrawers.background.fillRect(
      0,
      0,
      Client.width,
      Client.height
    );
  }

  Client.phaser.clear = function () {
    Object.keys(Client.phaser.globalDrawers).forEach((k) => {
      Client.phaser.globalDrawers[k].clear();
    });

    let circuit = Client.race.game
      ? Client.race.game.currentCircuit
      : Client.editor.editedCircuit;
    circuit.blocks.forEach((block) => {
      Client.phaser.clearBlock(block);
    });

    if (Client.race.game) {
      Client.race.game.players.forEach((player) => {
        Client.phaser.race.deletePlayer(player, 0, true);
      });
      Client.race.game.phantoms.forEach((phantom) => {
        Client.phaser.race.deletePlayer(phantom, 0, true);
      });
    }

    Client.phaser.scene.cameras.main.stopFollow();
  };

  Client.phaser.reset = function () {
    Client.phaser.scene.cameras.main.zoom = Client.phaser.editor.DEFAULT_ZOOM;
    Client.phaser.scene.cameras.main.stopFollow();
  };
};

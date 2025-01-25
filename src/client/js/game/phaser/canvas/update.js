module.exports = function (Client) {
  Client.phaser.update = function () {
    if (Client.phaser.isInEditorMode) {
      for (key in Client.phaser.controlKeys.editor) {
        Client.phaser.controlKeys.editor[key].controlFunction();
      }
      Client.phaser.editor.update();
    } else {
      Client.phaser.race.setDefaultControlState();
      for (key in Client.phaser.controlKeys.race) {
        Client.phaser.controlKeys.race[key].controlFunction();
      }
      Client.phaser.race.update();
    }
  };
};

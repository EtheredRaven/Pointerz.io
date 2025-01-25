const Circuit = require("../logic/circuit/Circuit");
const MIN_LOADING_TIME = 1000;

module.exports = function (Client) {
  Client.editor.initialize = function (circuitModel) {
    let startingMoment = performance.now();
    Client.editor.editedCircuit = new Circuit(circuitModel);
    Client.editor.editedCircuit.initCircuit();

    Client.phaser.isInEditorMode = true;
    Client.phaser.drawCircuit(Client.editor.editedCircuit);
    Client.phaser.editor.reset();
    Client.phaser.reset();

    setTimeout(() => {
      Client.svelte.setEditorLoading(false);
    }, Math.max(0, MIN_LOADING_TIME - (performance.now() - startingMoment)));
  };

  Client.editor.delete = function () {
    Client.phaser.clear();
    Client.editor.editedCircuit = undefined;
  };
};

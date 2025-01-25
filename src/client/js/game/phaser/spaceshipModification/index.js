const Player = require("../../logic/race/Player");

module.exports = function (Client) {
  // Compute the width according to the width of the window
  Client.spaceshipVisualiserRatio = 2.45;
  Client.spaceshipVisualiserWidth = 550;
  Client.spaceshipVisualiserHeight =
    Client.spaceshipVisualiserWidth / Client.spaceshipVisualiserRatio;

  Client.phaser.visualiserInstance = new Phaser.Game({
    type: Phaser.AUTO,
    width: Client.spaceshipVisualiserWidth,
    height: Client.spaceshipVisualiserHeight,
    parent: document.getElementById("spaceshipCanvas"),
    transparent: true,
    scene: {
      preload: function () {
        Client.phaser.preload.call(this, true);
      },
      create: function () {
        this.renderer.clearBeforeRender = false;
        Client.phaser.visualiserScene = this;

        Client.phaser.setVisualiserEnvironment = function (environmentType) {
          Client.visualiserSpaceship &&
            Client.visualiserSpaceship.setCurrentEnvironmentType(
              environmentType
            );
        };

        Client.phaser.updateVisualiserNFTs = function (selectedNFTs) {
          if (!Client.visualiserSpaceship) return;
          Client.visualiserSpaceship.setNFTs(selectedNFTs);
          Client.phaser.updateNFTs(
            Client.visualiserSpaceship,
            Client.phaser.visualiserScene
          );
        };

        Client.phaser.destroySpaceshipModificationCanvas = function () {
          Client.phaser.visualiserInstance.destroy();
          Client.phaser.visualiserInstance = null;
          Client.visualiserSpaceship = null;
          document.getElementById("spaceshipCanvas").innerHTML = "";
        };
      },
      update: function () {
        let userModel = Client.svelte.getUserModel();
        if (!Client.visualiserSpaceship && userModel) {
          Client.visualiserSpaceship = new Player({
            scale: 0.6,
            thrustScale: 0.6,
            nfts: userModel.nfts,
          });
          Client.visualiserSpaceship.reset({
            x: 0,
            y: 0,
            angle: 0,
          });
          Client.visualiserSpaceship.setPoint(
            { x: -60, y: 0 },
            this.sys.canvas.width / 2,
            this.sys.canvas.height / 2
          );
        } else {
          Client.phaser.race.updatePlayer(
            Client.visualiserSpaceship,
            true,
            Client.phaser.visualiserScene,
            true
          );
        }
      },
    },
  });
};

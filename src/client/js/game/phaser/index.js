module.exports = function (Client) {
  // Graphics definitions for the phaser instance
  require("./misc")(Client);
  require("./canvas")(Client);
  require("./circuit")(Client);
  require("./editor")(Client);
  require("./race")(Client);

  // Erase everything that was alive before in the selected div
  document.getElementById("game").innerHTML = "";
  if (Client.phaser.phaserInstance) {
    Client.phaser.scene.destroy();
    Client.phaser.phaserInstance.destroy();
  }

  // Create the phaser instance (canvas)
  Client.phaser.phaserInstance = new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: document.getElementById("game"),
    scene: {
      preload: Client.phaser.preload,
      create: Client.phaser.create,
      update: Client.phaser.update,
    },
  });
};

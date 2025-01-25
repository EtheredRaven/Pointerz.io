module.exports = function (Client) {
  Client.phaser.race.reset = function (hardReset = true) {
    if (hardReset) {
      Client.phaser.race.hidePhantoms = false;
    } else {
      Client.race.game.players.forEach((player) => {
        Client.phaser.race.resetPlayerGraphics(player);
      });
      Client.race.game.phantoms.forEach((phantom) => {
        Client.phaser.race.resetPlayerGraphics(phantom);
      });
    }
    Client.phaser.globalDrawers.driftMarks.clear();
    Client.phaser.globalDrawers.phantomsDriftMarks.clear();
    Client.phaser.race.currentLap = 1;
    Client.phaser.resumeEngineSounds();
  };
};

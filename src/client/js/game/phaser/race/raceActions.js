module.exports = function (Client) {
  Client.phaser.race.togglePhantomsVisility = function () {
    Client.phaser.race.hidePhantoms = !Client.phaser.race.hidePhantoms;
  };
};

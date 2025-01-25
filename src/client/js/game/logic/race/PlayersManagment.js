module.exports = function (Game, Player) {
  // Create a new player object
  Game.createPlayer = function (player) {
    player.updateInterval = Game.updateInterval;
    player.currentCircuit = Game.currentCircuit;
    let newPlayer = new Player(player);

    Game.addPlayer(newPlayer, true);
    return newPlayer;
  };

  // Add a player to the game
  Game.addPlayer = function (newPlayer, isAPlayer = false) {
    if (!isAPlayer) {
      newPlayer = new Player(newPlayer);
    }
    newPlayer.reset(Game.currentCircuit.start);
    Game.players.push(newPlayer);
    Game.playersQuad.push(newPlayer, true);

    return newPlayer;
  };

  // Delete the player
  Game.deletePlayer = function (player) {
    if (player != undefined) {
      if (player.sprite) {
        Game.Client.phaser.reduceSprite(player.sprite, 0.85);
      }
      if (player.thrust.sprite) {
        Game.Client.phaser.reduceSprite(player.thrust.sprite, 0.85);
      }
      if (player.nicknameText) {
        player.nicknameText.destroy();
      }
      Game.playersQuad.remove(player);
      if (Game.players.indexOf(player) == -1) {
        return;
      }
      Game.players.splice(Game.players.indexOf(player), 1);
      delete player;
    }
  };

  Game.getPlayer = function (player_id) {
    return Game.players.find((player) => player._id == player_id);
  };

  Game.getPlayers = function () {
    return this.players;
  };

  Game.loadPlayers = function (newPlayers) {
    newPlayers.forEach((player) => {
      this.addPlayer(player);
    });
  };

  // Get the players ranked by their best times on the different checkpoints
  Game.getRankedPlayers = function () {
    return [...this.players, ...this.phantoms].sort((a, b) => {
      let diff =
        b.liveCheckpointsCrossed.length - a.liveCheckpointsCrossed.length;
      if (!diff) {
        if (
          !b.liveCheckpointsCrossed.length &&
          !a.liveCheckpointsCrossed.length
        ) {
          diff = 0;
        } else {
          diff =
            a.liveCheckpointsCrossed[a.liveCheckpointsCrossed.length - 1]
              .instant -
            b.liveCheckpointsCrossed[b.liveCheckpointsCrossed.length - 1]
              .instant;
        }
      }
      return diff;
    });
  };
};

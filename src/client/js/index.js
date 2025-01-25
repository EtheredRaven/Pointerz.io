// Client
var Client = {
  isClient: true,
  svelte: {},
  editor: {},
  race: {
    Functions: require("./game/logic/Functions"),
    Constants: require("./game/logic/Constants"),
  },
  phaser: {
    editor: {},
    race: {},
  },
};
Client.width = Client.race.Constants.gameWidth;
Client.height = Client.race.Constants.gameHeight;
window.Client = Client;

require("./game/phaser")(Client); // The race display (phaser)
Client.phaser.initSpaceshipModificationCanvas = require("./game/phaser/spaceshipModification"); // The spaceship modification
require("./game/controllers/raceController")(Client); // The race management
require("./game/controllers/editorController")(Client); // The editor management
require("./crypto")(Client); // The crypto functions
require("./utils")(Client); // The client utils functions
require("./socket")(Client); // The communication with the server

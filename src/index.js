var Server = {
  isServer: true,
  Constants: require("./client/js/game/logic/Constants"),
  __dirname: __dirname,
};

require("./services/logging")(Server);
require("./services/httpServer")(Server);
require("./services/databaseConnection")(Server);
require("./routes")(Server);

require("./client/js/crypto/contracts")(Server);
require("./services/blockchainListener")(Server);
require("./services/weeklyCircuitPublishing")(Server);

require("./services/controllers/roomController")(Server);
require("./services/controllers/dataController")(Server);
require("./services/controllers/raceController")(Server);
require("./services/controllers/editorController")(Server);
require("./services/controllers/voteController")(Server);
require("./services/controllers/authenticationController")(Server);
require("./services/controllers/userController")(Server);

require("./services/emitters")(Server);
require("./services/events")(Server);

require("./utils/socketUtils")(Server);

require("./services/nftManager")(Server);

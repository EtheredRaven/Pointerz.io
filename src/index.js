var Server = {
  isServer: true,
  __dirname: __dirname,
};

require("./services/httpServer")(Server);
require("./services/logging")(Server);
require("./routes")(Server);

require("./services/dbInit")(Server);
require("./services/dbDataGetters")(Server);

require("./client/js/crypto/contracts")(Server);
require("./services/blockchain/blockchainListener")(Server);

require("./services/importGameLogic")(Server);
require("./services/roomsManagment")(Server);
require("./services/raceController")(Server);
require("./services/editorController")(Server);
require("./services/voteController")(Server);

require("./services/userAuthentication")(Server);
require("./services/userController")(Server);

require("./services/emitters")(Server);
require("./services/events")(Server);

require("./utils/socketUtils")(Server);

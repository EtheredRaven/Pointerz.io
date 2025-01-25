const Circuit = require("../client/js/game/logic/circuit/Circuit");

module.exports = function (Server) {
  Server.CircuitSchema = Server.mongoose.Schema(
    new Circuit().getSchema(Server.mongoose.Schema.Types.ObjectId)
  );

  Server.CircuitModel = Server.mongoose.model("Circuit", Server.CircuitSchema);
  require("./CircuitModelManagement")(Server, Server.CircuitModel);

  Server.CircuitModel.createNewCircuit = async function (circuitData) {
    try {
      let newCircuit = new Server.CircuitModel(circuitData);
      await newCircuit.save();
      return {};
    } catch (err) {
      Server.errorLogging("Create new circuit", err);
      return { retError: err };
    }
  };

  Server.CircuitModel.publishWinningCircuitAndDeleteAllVoteCircuits =
    async function () {
      try {
        let circuitOfTheWeek = await Server.CircuitModel.findOneAndUpdate(
          { campaignPublicationTime: -1 },
          { campaignPublicationTime: Date.now() },
          { sort: { upvotes: -1 } }
        );
        await Server.CircuitModel.deleteMany({ campaignPublicationTime: -1 });
        return circuitOfTheWeek;
      } catch (err) {
        Server.errorLogging("Publish winning circuit", err);
      }
    };
};

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
      Server.infoLogging("Create circuit", "success", newCircuit._id);
      return newCircuit;
    } catch (err) {
      Server.errorLogging("Create circuit", err);
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
        Server.infoLogging(
          "Publish winning circuit",
          "success",
          circuitOfTheWeek._id
        );
        return circuitOfTheWeek;
      } catch (err) {
        Server.errorLogging("Publish winning circuit", err);
      }
    };
};

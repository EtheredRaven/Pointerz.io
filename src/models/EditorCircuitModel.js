const { Promise } = require("mongoose");

module.exports = function (Server) {
  Server.EditorCircuitModel = Server.mongoose.model(
    "EditorCircuit",
    Server.CircuitSchema
  );

  require("./CircuitModelManagement")(Server, Server.EditorCircuitModel);

  Server.EditorCircuitModel.getEditorCircuits = async function (userId) {
    let circuits = await Server.EditorCircuitModel.find({
      _creatorId: Server.CircuitModel.toObjectId(userId),
    }).exec();
    return circuits;
  };

  Server.EditorCircuitModel.getEditorCircuit = async function (
    userId,
    circuitId
  ) {
    let circuit = await Server.EditorCircuitModel.findOne({
      _creatorId: Server.CircuitModel.toObjectId(userId),
      _id: Server.CircuitModel.toObjectId(circuitId),
    }).exec();
    return circuit;
  };

  Server.EditorCircuitModel.createNewEditorCircuit = async function (
    userId,
    newCircuitName
  ) {
    let newEditorCircuit = new Server.EditorCircuitModel({
      locked: false,
      width: Server.gameConstants.gameWidth,
      height: Server.gameConstants.gameHeight,
      lapsNumber: 1,
      creationDate: Date.now(),
      name: newCircuitName,
      _creatorId: userId,
      blocks: [],
      runs: [],
    });

    try {
      await newEditorCircuit.save();
      return { newEditorCircuit: newEditorCircuit };
    } catch (err) {
      Server.errorLogging("Create editor circuit", err);
      return { retError: err };
    }
  };

  Server.EditorCircuitModel.saveEditorCircuit = async function (
    userId,
    circuitObject
  ) {
    try {
      let deleteReplayPromises = [];
      circuitObject.runs.forEach((run) => {
        deleteReplayPromises.push(
          Server.ReplayModel.deleteOne({ _id: run._replayId })
        );
      });
      await Promise.all(deleteReplayPromises);
      circuitObject.runs = [];

      await Server.EditorCircuitModel.findOneAndUpdate(
        {
          _id: circuitObject._id,
          _creatorId: Server.CircuitModel.toObjectId(userId),
        },
        circuitObject
      );
      return {};
    } catch (err) {
      Server.errorLogging("Save editor circuit", err);
      return { retError: err };
    }
  };

  Server.EditorCircuitModel.deleteEditorCircuit = async function (
    userId,
    editorCircuitId
  ) {
    try {
      let deletedCircuit = await Server.EditorCircuitModel.findOneAndRemove({
        _id: Server.CircuitModel.toObjectId(editorCircuitId),
        _creatorId: Server.CircuitModel.toObjectId(userId),
      }).exec();
      return {
        deletedEditorCircuitId: editorCircuitId,
        deletedEditorCircuitName: deletedCircuit.name,
      };
    } catch (err) {
      Server.errorLogging("Delete editor circuit", err);
      return { retError: err };
    }
  };
};

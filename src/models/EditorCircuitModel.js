const { Promise } = require("mongoose");
const Constants = require("../client/js/game/logic/Constants");

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
      width: Constants.gameWidth,
      height: Constants.gameHeight,
      lapsNumber: 1,
      creationDate: Date.now(),
      name: newCircuitName,
      _creatorId: userId,
      blocks: [],
      runs: [],
    });

    try {
      await newEditorCircuit.save();
      Server.infoLogging(
        "Create editor circuit",
        "success",
        userId,
        newEditorCircuit._id
      );
      return { newEditorCircuit: newEditorCircuit };
    } catch (err) {
      Server.errorLogging("Create editor circuit", err);
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

      let ret = await Server.EditorCircuitModel.findOneAndUpdate(
        {
          _id: circuitObject._id,
          _creatorId: Server.CircuitModel.toObjectId(userId),
        },
        circuitObject
      );
      Server.infoLogging(
        "Save editor circuit",
        "success",
        circuitObject._creatorId,
        circuitObject._id
      );
      return ret;
    } catch (err) {
      Server.errorLogging("Save editor circuit", err);
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

      Server.infoLogging(
        "Delete editor circuit",
        "success",
        userId,
        deletedCircuit._id
      );
      return {
        deletedEditorCircuitId: editorCircuitId,
        deletedEditorCircuitName: deletedCircuit.name,
      };
    } catch (err) {
      Server.errorLogging("Delete editor circuit", err);
    }
  };
};

module.exports = function (Server) {
  Server.getEditorCircuits = async function (socket) {
    let editorCircuits = await Server.EditorCircuitModel.getEditorCircuits(
      socket.userModel._id
    );
    return editorCircuits;
  };

  Server.createEditorCircuit = async function (socket, circuitName) {
    let emitReturnEvent = Server.initReturnEvent(
      Server.emitEditorCircuitCreated,
      socket,
      "Create editor circuit"
    );

    let ret = await Server.EditorCircuitModel.createNewEditorCircuit(
      socket.userModel._id,
      circuitName
    );
    ret.retError
      ? emitReturnEvent({ retError: ret.retError })
      : emitReturnEvent({
          retInfo: "New circuit created with the name " + circuitName,
          data: { newEditorCircuit: ret.newEditorCircuit },
        });
  };

  Server.deleteEditorCircuit = async function (socket, circuitId) {
    let emitReturnEvent = Server.initReturnEvent(
      Server.emitEditorCircuitDeleted,
      socket,
      "Delete editor circuit"
    );

    let ret = await Server.EditorCircuitModel.deleteEditorCircuit(
      socket.userModel._id,
      circuitId
    );
    ret.retError
      ? emitReturnEvent({ retError: ret.retError })
      : emitReturnEvent({
          retInfo:
            "Circuit named " +
            ret.deletedEditorCircuitName +
            " successfully deleted !",
          data: { deletedEditorCircuitId: ret.deletedEditorCircuitId },
        });
  };

  Server.saveEditorCircuit = async function (socket, circuitObject) {
    let emitReturnEvent = Server.initReturnEvent(
      Server.emitEditorCircuitSaved,
      socket,
      "Save editor circuit"
    );
    let ret = await Server.EditorCircuitModel.saveEditorCircuit(
      socket.userModel._id,
      circuitObject
    );
    ret.retError
      ? emitReturnEvent(ret)
      : emitReturnEvent({ retInfo: "Circuit successfully saved !" });
  };

  Server.publishEditorCircuit = async function (socket, circuitId) {
    let emitReturnEvent = Server.initReturnEvent(
      Server.emitEditorCircuitPublished,
      socket,
      "Publish editor circuit"
    );

    let dbEditorCircuit = await Server.EditorCircuitModel.getEditorCircuit(
      socket.userModel._id,
      circuitId
    );
    if (dbEditorCircuit) {
      dbEditorCircuit = dbEditorCircuit.toObject();
      dbEditorCircuit.campaignPublicationTime = -1;
      dbEditorCircuit.upvotes = 0;
      let ret = await Server.CircuitModel.createNewCircuit(dbEditorCircuit);
      ret.retError
        ? emitReturnEvent({
            retError:
              "Publishing error... You may have already published this circuit ! ",
          })
        : emitReturnEvent({
            retInfo: "Your circuit was successfully published !",
          });
    } else {
      emitReturnEvent({
        retError: "This circuit id does not match any of your circuits !",
      });
    }
  };
};

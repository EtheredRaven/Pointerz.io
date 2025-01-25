module.exports = function (Client) {
  Client.registerEvent("editor_circuit_created", (data) => {
    Client.svelte.updateEditorCircuitCreated(data);
  });

  Client.registerEvent("editor_circuit_deleted", (data) => {
    Client.svelte.updateEditorCircuitDeleted(data);
  });

  Client.registerEvent("editor_circuit_saved", (dbSavedResult) => {
    Client.svelte.showEditorCircuitSavedState(dbSavedResult);
  });

  Client.registerEvent("editor_circuit_published", (dbSavedResult) => {
    Client.svelte.showEditorCircuitPublishedState(dbSavedResult);
  });

  Client.registerEvent("got_editor_circuits", (editorCircuits) => {
    Client.svelte.updateLoadedEditorCircuits(editorCircuits);
  });

  Client.socket.createNewEditorCircuit = function (circuitName) {
    Client.socket.emit("create_new_editor_circuit", circuitName);
  };

  Client.socket.deleteEditorCircuit = function (circuitId) {
    Client.socket.emit("delete_editor_circuit", circuitId);
  };

  Client.socket.getEditorCircuits = function () {
    Client.socket.emit("get_editor_circuits");
  };

  Client.socket.saveEditorCircuit = function (circuitObject) {
    Client.socket.emit(
      "save_editor_circuit",
      circuitObject.getFilteredDatabaseData()
    );
  };

  Client.socket.publishEditorCircuit = function (circuitObject) {
    Client.socket.emit("publish_editor_circuit", circuitObject._id);
  };
};

module.exports = function (Server, socket) {
  function assertCircuitNameLength(circuitName) {
    if (
      circuitName.length < Server.Constants.MIN_CIRCUIT_NAME_LENGTH ||
      Server.Constants.MAX_CIRCUIT_NAME_LENGTH < circuitName.length
    ) {
      throw new Error("Circuit name must be between 3 and 20 characters.");
    }
  }

  Server.registerEvent(
    socket,
    "create_new_editor_circuit",
    function (circuitName) {
      Server.assertParametersExist({
        circuitName: circuitName,
      });
      Server.assertUserIsLoggedIn(socket);
      assertCircuitNameLength(circuitName);
      Server.createEditorCircuit(socket, circuitName);
    }
  );

  Server.registerEvent(socket, "delete_editor_circuit", function (circuitId) {
    Server.assertParametersExist({
      circuitId: circuitId,
    });
    Server.assertUserIsLoggedIn(socket);
    Server.deleteEditorCircuit(socket, circuitId);
  });

  Server.registerEvent(socket, "save_editor_circuit", function (circuitObject) {
    Server.assertParametersExist({ circuitObject: circuitObject });
    Server.assertUserIsLoggedIn(socket);
    Server.saveEditorCircuit(socket, circuitObject);
  });

  Server.registerEvent(socket, "publish_editor_circuit", function (circuitId) {
    Server.assertParametersExist({ circuitId: circuitId });
    Server.assertUserIsLoggedIn(socket);
    Server.publishEditorCircuit(socket, circuitId);
  });

  Server.registerEvent(
    socket,
    "rename_editor_circuit",
    function (selectedCircuitId, newCircuitName) {
      Server.assertParametersExist({
        selectedCircuitId: selectedCircuitId,
        newCircuitName: newCircuitName,
      });
      Server.assertUserIsLoggedIn(socket);
      assertCircuitNameLength(newCircuitName);
      Server.renameEditorCircuit(socket, selectedCircuitId, newCircuitName); // async
    }
  );
};

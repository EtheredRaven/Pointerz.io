module.exports = function (Server, socket) {
  Server.registerEvent(
    socket,
    "create_new_editor_circuit",
    function (circuitName) {
      Server.assertParametersExist({
        circuitName: circuitName,
      });
      Server.assertUserIsLoggedIn(socket);
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
};

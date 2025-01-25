module.exports = function (Server, socket) {
  // Send the circuit records to the user
  Server.registerEvent(socket, "get_circuits_records", async function () {
    Server.assertUserIsLoggedIn(socket, true); //  A TESTER
    let ret = await Server.getCircuitsAndRecords(socket, socket.player._id);
    Server.emitCircuitsAndRecords(socket, ret.circuits, ret.records);
  });

  Server.registerEvent(socket, "get_editor_circuits", async function () {
    Server.assertUserIsLoggedIn(socket);
    let editorCircuits = await Server.getEditorCircuits(socket);
    Server.emitEditorCircuits(socket, editorCircuits);
  });
};

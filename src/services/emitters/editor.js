module.exports = function (Server) {
  Server.emitEditorCircuitCreated = function (socket, data) {
    Server.emitToSocket("editor_circuit_created", socket, [data]);
  };

  Server.emitEditorCircuitSaved = function (socket, data) {
    Server.emitToSocket("editor_circuit_saved", socket, [data]);
  };

  Server.emitEditorCircuitPublished = function (socket, data) {
    Server.emitToSocket("editor_circuit_published", socket, [data]);
  };

  Server.emitEditorCircuitDeleted = function (socket, data) {
    Server.emitToSocket("editor_circuit_deleted", socket, [data]);
  };
};

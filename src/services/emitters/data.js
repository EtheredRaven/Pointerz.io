module.exports = function (Server) {
  Server.emitCircuitsAndRecords = function (socket, circuits, records) {
    Server.emitToSocket("circuit_records", socket, [circuits, records]);
  };

  Server.emitEditorCircuits = function (socket, editorCircuits) {
    Server.emitToSocket("got_editor_circuits", socket, [editorCircuits]);
  };

  Server.emitErrorEvent = function (socket, error) {
    Server.emitToSocket("error_event", socket, [error]);
  };

  Server.emitInfoEvent = function (socket, info) {
    Server.emitToSocket("info_event", socket, [info]);
  };
};

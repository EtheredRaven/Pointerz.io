module.exports = function (Client) {
  // Update the menu display
  Client.registerEvent("circuit_records", (circuits, records) => {
    Client.svelte.updateRecordsDisplay(circuits, records);
  });

  Client.registerEvent("error_event", (error) => {
    Client.svelte.showError(error);
  });

  Client.registerEvent("info_event", (info) => {
    Client.svelte.showInfo(info);
  });

  // Ask for the circuit records
  Client.socket.getCircuitRecords = function () {
    Client.socket.emit("get_circuits_records");
  };
};

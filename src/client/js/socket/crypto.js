module.exports = function (Client) {
  Client.socket.emitLinkKoinosAccount = function (address, accountType) {
    Client.socket.emit("link_koinos_account", address, accountType);
  };
};

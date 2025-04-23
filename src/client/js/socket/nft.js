module.exports = function (Client) {
  Client.socket.getNfts = function () {
    Client.socket.emit("getNfts");
  };

  Client.socket.createNewNfts = function (nftData) {
    Client.socket.emit("createNewNfts", nftData);
  };

  Client.socket.deleteNft = function (nftId) {
    Client.socket.emit("deleteNft", nftId);
  };
};

module.exports = function (Server) {
  Server.accountsWaitingForLink = {};

  Server.updateNFTSelection = async function (socket, nftSelection) {
    let emitReturnEvent = Server.initReturnEvent(
      Server.emitUpdatedUser,
      socket,
      "NFT selection updated"
    );

    let ret = await Server.UserModel.updateNFTSelection(socket, nftSelection);
    if (ret) {
      socket.userModel = ret;
      emitReturnEvent({
        retInfo: "NFT selection updated",
        data: { userModel: ret },
      });
    } else {
      emitReturnEvent({ retError: "Error updating NFT selection" });
    }
  };

  Server.linkKoinosAccount = async function (socket, address, accountType) {
    let emitReturnEvent = Server.initReturnEvent(
      Server.emitUpdatedUser,
      socket,
      "Koinos account linked"
    );

    let linkingFunction = async function (
      username = socket.userModel.username,
      nftsIds = []
    ) {
      if (username != socket.userModel.username) {
        return emitReturnEvent({
          retError: "Usernames do not match",
        });
      }
      let ret = await Server.UserModel.linkKoinosAccount(
        socket,
        address,
        accountType,
        nftsIds
      );
      if (ret) {
        socket.userModel = ret;
        emitReturnEvent({
          retInfo: address
            ? "Koinos account linked"
            : "Koinos account unlinked",
          data: { userModel: ret },
        });
      } else {
        emitReturnEvent({ retError: "Error linking the account" });
      }
    };

    if (!address) {
      return await linkingFunction();
    }

    let user = await Server.UserModel.findOne({ koinosAccount: address });
    if (user) {
      return emitReturnEvent({
        retError: "Address already linked to another account",
      });
    }

    Server.infoLogging("Account linking requested", socket, address);
    Server.accountsWaitingForLink[address] = linkingFunction;
  };
};

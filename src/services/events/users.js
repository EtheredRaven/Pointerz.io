module.exports = function (Server, socket) {
  Server.registerEvent(
    socket,
    "sign_in",
    function (playerName, playerMail, playerPassword) {
      Server.assertParametersExist({
        playerName: playerName,
        playerMail: playerMail,
        playerPassword: playerPassword,
      });
      Server.signInUser(socket, playerName, playerMail, playerPassword); // async
    }
  );

  Server.registerEvent(
    socket,
    "log_in",
    function (playerName, playerPassword, anonymous) {
      Server.assertParametersExist({
        playerName: playerName,
        playerPassword: playerPassword,
      });
      Server.logInUser(socket, playerName, playerPassword, anonymous); // async
    }
  );

  Server.registerEvent(socket, "update_nft_selection", function (nftSelection) {
    nftSelection = nftSelection || [];
    Server.assertUserIsLoggedIn(socket);
    Server.updateNFTSelection(socket, nftSelection); // async
  });

  Server.registerEvent(
    socket,
    "link_koinos_account",
    function (address, accountType) {
      address = address || null;
      Server.assertUserIsLoggedIn(socket);
      Server.linkKoinosAccount(socket, address, accountType); // async
    }
  );
};

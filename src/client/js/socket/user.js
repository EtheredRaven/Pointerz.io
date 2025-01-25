module.exports = function (Client) {
  Client.registerEvent("signed_in", (data) => {
    Client.svelte.signedIn(data);
  });

  Client.registerEvent("logged_in", (data) => {
    Client.svelte.loggedIn(data);
    Client.svelte.updateUserModel(data.user);
  });

  Client.registerEvent("updated_user", (data) => {
    console.log(data);
    data.userModel && Client.svelte.updateUserModel(data.userModel);
  });

  Client.socket.logIn = function (...params) {
    Client.socket.emit("log_in", ...params);
  };

  Client.socket.signIn = function (...params) {
    Client.socket.emit("sign_in", ...params);
  };

  Client.socket.updateNFTSelection = function (nftSelection) {
    Client.socket.emit("update_nft_selection", nftSelection);
  };
};

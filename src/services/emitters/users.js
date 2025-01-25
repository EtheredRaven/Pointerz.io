module.exports = function (Server) {
  Server.emitSignedIn = function (socket, data) {
    Server.emitToSocket("signed_in", socket, [data]);
  };

  Server.emitLoggedIn = function (socket, data) {
    Server.emitToSocket("logged_in", socket, [data]);
  };

  Server.emitUpdatedUser = function (socket, data) {
    Server.emitToSocket("updated_user", socket, [data]);
  };
};

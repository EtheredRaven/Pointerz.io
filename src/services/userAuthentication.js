const { Promise } = require("mongoose");

module.exports = function (Server) {
  Server.usernameMaxChar = 19;

  Server.signInUser = async function (
    socket,
    playerName,
    playerMail,
    playerPassword
  ) {
    let retError;
    // Preprocessing and definitions
    playerName = playerName.substring(0, Server.usernameMaxChar);

    let emitReturnEvent = Server.initReturnEvent(
      Server.emitSignedIn,
      socket,
      "Sign in"
    );

    // Form verification
    if (
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        playerMail
      )
    ) {
      retError = "The given email " + playerMail + " is invalid";
    }
    if (playerName.length < 3) {
      retError = "Your username must be at least three characters long.";
    }
    if (playerPassword.length < 5) {
      retError = "Your password must be at least five characters long.";
    }
    if (retError) {
      emitReturnEvent({ retError: retError });
      return;
    }

    // Check username uniqueness
    var user = await Server.UserModel.findOne({ username: playerName });
    if (user) {
      emitReturnEvent({
        retError:
          "The name " + playerName + " is already taken by another user.",
      });
      return;
    }

    // Create new user
    let newUser = new Server.UserModel({
      username: playerName,
      password: playerPassword,
      email: playerMail,
      circuitVotes: [],
    });
    newUser.save((err) => {
      err
        ? emitReturnEvent({ retError: err })
        : emitReturnEvent({
            retInfo: "You have been successfully signed-in !",
          });
    });
  };

  Server.logInUser = async function (
    socket,
    playerName,
    playerPassword,
    anonymous
  ) {
    // Preprocessing and definitions
    playerName = playerName.substring(0, Server.usernameMaxChar);

    let emitReturnEvent = Server.initReturnEvent(
      Server.emitLoggedIn,
      socket,
      "Log in"
    );

    function getReturnData() {
      return {
        circuits: socket.loadedCircuits,
        editorCircuits: socket.loadedEditorCircuits,
        voteCircuits: socket.loadedVoteCircuits,
        records: socket.loadedRecords,
        user: socket.userModel,
        anonymous: anonymous,
      };
    }

    // If anonymous user = new player testing the game
    if (anonymous) {
      // We create a basic user model but he is not logged in
      socket.loggedIn = false;
      socket.userModel = {
        _id: Server.mongoose.Types.ObjectId(),
        username: playerName,
      };

      // Load the circuits and there is no records for non-logged in user
      let ret = await Server.CircuitModel.getCircuits();
      socket.loadedCircuits = ret.circuits;
      socket.loadedRecords = [];
      socket.loadedEditorCircuits = [];
      socket.loadedVoteCircuits = [];

      emitReturnEvent({ data: getReturnData() });
    } else {
      // Check if this user exists
      let userModel = await Server.UserModel.findOne({ username: playerName });
      if (!userModel) {
        emitReturnEvent({ retError: "There is no user with this name" });
        return;
      }

      // Check if the encrypted password matches
      userModel.comparePassword(playerPassword, async function (err, isMatch) {
        if (!isMatch || err) {
          emitReturnEvent({ retError: err ? err : "The password is wrong" });
        } else {
          // Log in the user
          socket.loggedIn = true;
          socket.userModel = userModel;

          // Load the circuits and the records
          let promises = [
            Server.CircuitModel.getCircuits(userModel._id),
            Server.EditorCircuitModel.getEditorCircuits(userModel._id),
            Server.CircuitModel.getCircuits(userModel._id, [], false),
          ];
          let res = await Promise.all(promises);
          socket.loadedCircuits = res[0].circuits;
          socket.loadedRecords = res[0].records;
          socket.loadedEditorCircuits = res[1];
          socket.loadedVoteCircuits = res[2].circuits;

          emitReturnEvent({ data: getReturnData() });
        }
      });
    }
  };
};

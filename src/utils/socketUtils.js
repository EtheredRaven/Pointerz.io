module.exports = function (Server) {
  Server.registerEvent = function (socket, eventName, cb, logIt = true) {
    socket.on(eventName, async function (...args) {
      try {
        await Promise.resolve().then(() => cb.apply(this, args));
      } catch (err) {
        logIt && Server.errorLogging(eventName, err, socket);
      }
    });
  };

  Server.emitToSocket = function (
    eventName,
    socket,
    paramsArray,
    asserters = () => {}
  ) {
    try {
      asserters();
      socket.emit(eventName, ...paramsArray);
      Server.infoLogging(eventName, "emitted", socket);
    } catch (err) {
      Server.errorLogging(eventName, err, socket);
    }
  };

  Server.broadcastToRoom = function (
    eventName,
    roomId,
    paramsArray,
    excludedSocket = false,
    asserters = () => {}
  ) {
    try {
      asserters();
      let broadcastFunction = excludedSocket
        ? excludedSocket.broadcast.to(roomId)
        : Server.io.sockets.to(roomId);
      broadcastFunction.emit(eventName, ...paramsArray);
      Server.infoLogging(eventName, "broadcasted", roomId);
    } catch (err) {
      Server.errorLogging(eventName, err, roomId);
    }
  };

  Server.initReturnEvent = function (emitFunction, socket, loggingEvent) {
    return ({ retError = false, retInfo = false, data = {} }) => {
      retError
        ? Server.errorLogging(loggingEvent, retError, socket)
        : Server.infoLogging(loggingEvent, retInfo, socket);

      emitFunction(socket, {
        retError: retError,
        retInfo: retInfo,
        ...data,
      });
    };
  };

  Server.assertParametersExist = function (parameters) {
    for (const parameterName in parameters) {
      if (parameters[parameterName] == undefined) {
        throw new Error("Undefined parameter " + parameterName);
      }
    }
  };

  Server.assertUserIsLoggedIn = function (socket, anonymousPermitted = false) {
    if (!socket) {
      throw new Error("This socket doesn't exist");
    } else if (!socket.userModel) {
      throw new Error("Unlogged users are not permitted to do that");
    } else if (!anonymousPermitted && !socket.loggedIn) {
      throw new Error("Anonymous users are not permitted to do that");
    }
  };

  Server.assertUserIsPlaying = function (socket) {
    if (!socket.player) {
      throw new Error("Unplaying users are not permitted to do that");
    } else if (!socket.roomId) {
      throw new Error("No room specified");
    } else if (!Server.rooms[socket.roomId]) {
      throw new Error("The specified room doesn't exist");
    }
  };
};

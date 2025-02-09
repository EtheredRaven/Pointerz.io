const {
  thrustDriftAdditionRotationRelativeForce,
} = require("../client/js/game/logic/Constants");

const RATE_LIMIT = {
  windowMs: 1000, // 1 second
  maxRequests: 3, // Max 20 requests per second
  excludedEvents: ["new_position"], // Events that bypass rate limiting
};

module.exports = function (Server) {
  Server.socketRateLimits = new Map();

  // Rate limiter function
  Server.checkRateLimit = function (socket, eventName) {
    if (RATE_LIMIT.excludedEvents.includes(eventName)) {
      return true;
    }

    const now = Date.now();
    const socketId = socket.id;

    if (!Server.socketRateLimits.has(socketId)) {
      Server.socketRateLimits.set(socketId, {
        requests: 1,
        windowStart: now,
      });
      return true;
    }

    const limiter = Server.socketRateLimits.get(socketId);

    // Reset window if needed
    if (now - limiter.windowStart > RATE_LIMIT.windowMs) {
      limiter.requests = 1;
      limiter.windowStart = now;
      return true;
    }

    // Check rate limit
    if (limiter.requests >= RATE_LIMIT.maxRequests) {
      Server.errorLogging("Rate limit exceeded", socket);
      return false;
    }

    limiter.requests++;
    return true;
  };

  // Clean up rate limiters on disconnect
  Server.cleanupRateLimit = function (socket) {
    Server.socketRateLimits.delete(socket.id);
  };

  Server.registerEvent = function (
    socket,
    eventName,
    cb,
    logIt = thrustDriftAdditionRotationRelativeForce
  ) {
    socket.on(eventName, async function (...args) {
      try {
        // Check rate limit before processing event
        if (!Server.checkRateLimit(socket, eventName)) {
          socket.emit("error_event", "Too many requests. Please slow down.");
          return;
        }
        logIt && Server.infoLogging(eventName, socket, "received");
        await Promise.resolve().then(() => cb.apply(this, args));
      } catch (err) {
        logIt && Server.errorLogging(eventName, socket, err);
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
      Server.infoLogging(eventName, socket, "emitted");
    } catch (err) {
      Server.errorLogging(eventName, socket, err);
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
      Server.infoLogging(eventName, "", "broadcasted", roomId);
    } catch (err) {
      Server.errorLogging(eventName, "", err, roomId);
    }
  };

  Server.initReturnEvent = function (emitFunction, socket, loggingEvent) {
    return ({ retError = false, retInfo = false, data = {} }) => {
      retError
        ? Server.errorLogging(loggingEvent, socket, retError)
        : Server.infoLogging(loggingEvent, socket, retInfo);

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

const {
  thrustDriftAdditionRotationRelativeForce,
} = require("../client/js/game/logic/Constants");

const RATE_LIMIT = {
  windowMs: 1000, // 1 second
  maxRequests: 3, // Max 20 requests per second
  excludedEvents: ["new_position"], // Events that bypass rate limiting
};

const CONNECTION_LIMITS = {
  maxConnectionsPerIP: 3,
  maxReconnectAttempts: 3,
  reconnectTimeout: 5000, // 5 seconds
};

module.exports = function (Server) {
  Server.socketRateLimits = new Map();
  Server.ipConnections = new Map();
  Server.userSockets = new Map(); // userId -> socketId map

  // Add socket disconnect cleanup
  Server.disconnectUserSockets = function (userId, exceptSocket = {}) {
    const existingSocketId = Server.userSockets.get(userId);
    if (existingSocketId && existingSocketId !== exceptSocket.id) {
      const existingSocket = Server.io.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        Server.infoLogging(
          "Disconnecting duplicate user socket",
          existingSocket,
          exceptSocket
        );
        existingSocket.disconnect(true);
      }
    }
  };

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

  // Connection limiting middleware
  Server.checkConnectionLimit = function (socket, next) {
    const clientIP = socket.handshake.address;

    // Get current connections for this IP
    const currentConnections = Server.ipConnections.get(clientIP) || {
      count: 0,
      reconnectAttempts: 0,
      lastReconnectTime: 0,
    };

    // Check reconnection rate
    const now = Date.now();
    if (
      now - currentConnections.lastReconnectTime <
      CONNECTION_LIMITS.reconnectTimeout
    ) {
      currentConnections.reconnectAttempts++;

      if (
        currentConnections.reconnectAttempts >
        CONNECTION_LIMITS.maxReconnectAttempts
      ) {
        Server.errorLogging(
          "Connection blocked - Too many reconnect attempts",
          {
            ip: clientIP,
            attempts: currentConnections.reconnectAttempts,
          }
        );
        return next(new Error("Too many reconnection attempts"));
      }
    } else {
      currentConnections.reconnectAttempts = 0;
    }
    // Check total connections
    if (currentConnections.count >= CONNECTION_LIMITS.maxConnectionsPerIP) {
      Server.errorLogging(
        "Connection blocked - Too many connections",
        clientIP,
        currentConnections.count
      );
      return next(new Error("Too many connections from this IP"));
    }

    // Update connection tracking
    currentConnections.count++;
    currentConnections.lastReconnectTime = now;
    Server.ipConnections.set(clientIP, currentConnections);

    // Add disconnect handler
    socket.on("disconnect", () => {
      const connections = Server.ipConnections.get(clientIP);
      if (connections) {
        connections.count--;
        if (connections.count <= 0) {
          Server.ipConnections.delete(clientIP);
        } else {
          Server.ipConnections.set(clientIP, connections);
        }
      }
    });

    next();
  };

  Server.io.use(Server.checkConnectionLimit);
};

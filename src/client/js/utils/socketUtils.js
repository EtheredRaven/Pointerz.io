module.exports = function (Client) {
  Client.registerEvent = function (eventName, cb) {
    Client.socket.on(eventName, function (...args) {
      if (args && args[0]) {
        args[0].retError && Client.svelte.showError(args[0].retError);
        args[0].retInfo && Client.svelte.showInfo(args[0].retInfo);
      }

      try {
        cb(...args);
      } catch (err) {
        console.error(eventName, err);
      }
    });
  };

  Client.assertRaceIsInitialized = function () {
    if (!Client.race.game) {
      throw new Error("Race is not initialized");
    }
  };
};

module.exports = function (Client) {
  Client.phaser.controlKeys = {
    editor: {},
    race: {},
  };

  Client.phaser.addControlKeyPress = function (
    canvas,
    key,
    delayBetweenTwoPress,
    callback,
    keyUp = false
  ) {
    let eventName = key + (keyUp ? "-UP" : "-DOWN");
    if (!Client.phaser.controlKeys[canvas][eventName]) {
      let controlKeyObject = {
        keyEvent: Client.phaser.scene.input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes[key]
        ),
        delayBetweenTwoPress: delayBetweenTwoPress,
        callback: callback,
        lastCall: performance.now(),
      };
      Client.phaser.controlKeys[canvas][eventName] = controlKeyObject;
      controlKeyObject.controlFunction = () => {
        let currentInstant = performance.now();
        if (
          (keyUp
            ? !controlKeyObject.keyEvent.isDown
            : controlKeyObject.keyEvent.isDown) &&
          currentInstant - controlKeyObject.lastCall >
            controlKeyObject.delayBetweenTwoPress
        ) {
          controlKeyObject.lastCall = currentInstant;
          controlKeyObject.callback();
        }
      };
    }
  };
};

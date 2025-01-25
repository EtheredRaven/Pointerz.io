module.exports = function (Client) {
  // Create the circuit display
  Client.phaser.drawCircuit = function (circuitToDraw) {
    circuitToDraw.blocks.forEach((block) => {
      Client.phaser.drawBlock(block);
    });
  };
};

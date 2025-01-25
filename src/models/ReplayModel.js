module.exports = function (Server) {
  var ReplaySchema = Server.mongoose.Schema({
    _userId: Server.mongoose.Schema.Types.ObjectId,
    _circuitId: Server.mongoose.Schema.Types.ObjectId,
    nickname: String,
    runTime: Number,
    nfts: [
      {
        nftId: Number,
        nftName: String,
        nftCategory: String,
        nftSelected: Boolean,
      },
    ],
    checkpointsCrossed: [
      {
        blockType: Number,
        checkpointId: Server.mongoose.Schema.Types.ObjectId,
        instant: Number,
        currentLap: Number,
      },
    ],
    positions: [
      {
        currentInstant: Number,
        x: Number,
        y: Number,
        angle: Number,
        currentEnvironmentType: Number,
        isTurning: Number,
        isAccelerating: Boolean,
        isBraking: Boolean,
        driftPower: Number,
        thrust: {
          cropRectX: Number,
          particlesEmitter: {
            on: Boolean,
            x: Number,
            y: Number,
            scaleMin: Number,
            scaleMax: Number,
            XSpeedMax: Number,
            YSpeedMax: Number,
            XSpeedMin: Number,
            YSpeedMin: Number,
          },
        },
      },
    ],
  });
  Server.ReplayModel = Server.mongoose.model("Replay", ReplaySchema);

  Server.ReplayModel.getReplay = async function (replayId) {
    let ret = await Server.ReplayModel.findOne({ _id: replayId });
    return ret;
  };

  Server.ReplayModel.getReplays = async function (replayIds = []) {
    let ret = await Server.ReplayModel.find({ _id: { $in: replayIds } });
    return ret;
  };
};

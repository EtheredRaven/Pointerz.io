const { Promise } = require("mongoose");
const Functions = require("../client/js/game/logic/Functions");

module.exports = function (Server, circuitModel) {
  // Convert strings to object ids
  circuitModel.toObjectId = function (ids) {
    if (!Array.isArray(ids)) {
      return ids ? Server.mongoose.Types.ObjectId(ids.toString()) : null;
    }
    for (let i = 0; i < ids.length; i++) {
      ids[i] = Server.mongoose.Types.ObjectId(ids[i].toString());
    }
    return ids;
  };

  class CircuitQueue {
    constructor() {
      this.queue = [];
      this.processing = false;
    }

    async add(record, replay) {
      return new Promise((resolve, reject) => {
        Server.infoLogging(
          "Add in records queue",
          "success",
          record.nickname,
          record.circuitId
        );
        this.queue.push({ record, replay, resolve, reject });
        this.process();
      });
    }

    async _saveRecord(record, replay) {
      try {
        const savedReplay = await new Server.ReplayModel(replay).save();
        const circuit = await circuitModel.findById(record.circuitId);
        let ranking = 0;

        if (!circuit) {
          throw new Error("Circuit not found");
        }

        record._replayId = savedReplay._id;

        if (circuit.runs.length === 0) {
          circuit.runs.push(record);
        } else {
          let nm = 0;
          let np = circuit.runs.length - 1;

          // Handle edge cases first - exact same logic as original
          if (circuit.runs[np].runTime < record.runTime) {
            circuit.runs.push(record);
            ranking = circuit.runs.length - 1;
          } else if (circuit.runs[0].runTime > record.runTime) {
            circuit.runs.unshift(record);
          } else {
            // Same dichotomy search as original
            while (np - nm > 1) {
              let n = Math.round((np + nm) / 2);
              if (circuit.runs[n].runTime < record.runTime) {
                nm = n;
              } else {
                np = n;
              }
            }
            // Fixed insertion logic to match original
            if (circuit.runs[np].runTime < record.runTime) {
              ranking = np + 1;
            } else if (circuit.runs[nm].runTime > record.runTime) {
              ranking = nm;
            } else {
              ranking = np;
            }
            circuit.runs.splice(ranking, 0, record);
          }
        }

        await circuit.save();
        Server.infoLogging(
          "Save record and replay",
          "success",
          replay.nickname,
          circuit._id,
          savedReplay._id
        );
        return ranking; // Return only ranking to match original
      } catch (error) {
        Server.errorLogging("Save record and replay", error);
        throw error;
      }
    }

    async process() {
      if (this.processing || this.queue.length === 0) return;
      this.processing = true;

      const { record, replay, resolve, reject } = this.queue[0];
      Server.infoLogging(
        "Process records queue",
        "success",
        record.nickname,
        record.circuitId
      );
      try {
        const ranking = await this._saveRecord(record, replay);
        resolve(ranking);
      } catch (error) {
        reject(error);
      } finally {
        this.queue.shift();
        this.processing = false;
        if (this.queue.length > 0) {
          this.process();
        }
      }
    }
  }

  // Initialize queue storage
  if (!Server.circuitQueues) {
    Server.circuitQueues = new Map();
  }

  // Simplified insertRecordAndReplay that uses queue
  circuitModel.insertRecordAndReplay = async function (
    circuitId,
    record,
    replay
  ) {
    if (!Server.circuitQueues.has(circuitId)) {
      Server.circuitQueues.set(circuitId, new CircuitQueue());
    }

    record.circuitId = circuitId;
    const queue = Server.circuitQueues.get(circuitId);
    return await queue.add(record, replay);
  };

  // Load a single circuit for a room creation
  circuitModel.getCircuit = async function (
    circuitId,
    userId = null,
    getCampaignCircuit = true
  ) {
    let ret = await circuitModel.getCircuits(
      userId,
      [circuitId],
      getCampaignCircuit
    );
    return {
      circuit: ret.circuits.length > 0 ? ret.circuits[0] : undefined,
      record: ret.records.length > 0 ? ret.records[0] : undefined,
    };
  };

  // Load several circuits with its records (for display)
  circuitModel.getCircuits = async function (
    userId,
    circuitIds = [],
    getCampaignCircuits = true
  ) {
    // Format the ids for the aggregation
    userId = circuitModel.toObjectId(userId);
    circuitIds = circuitModel.toObjectId(circuitIds);

    // Construct the request to the database
    let req = [];
    let match = {
      $match: {},
    };
    circuitIds.length > 0
      ? (match.$match._id = { $in: circuitIds })
      : (match.$match.campaignPublicationTime = getCampaignCircuits
          ? { $gte: 0 }
          : { $lte: -1 });
    req.push(match);

    req.push({
      $sort: { campaignPublicationTime: 1 },
    });

    req.push({
      $project: {
        blocks: 1,
        images: 1,
        width: 1,
        height: 1,
        lapsNumber: 1,
        campaignPublicationTime: 1,
        upvotes: 1,
        name: 1,
        runs: { $slice: ["$runs", 5] }, // display only the 5 best times
        runsNumber: { $size: "$runs" }, // needed for picking random phantoms
      },
    });

    let circuits = circuitModel.aggregate(req);
    let records = circuitModel.getUserRecords(userId, circuitIds);

    let ret = await Promise.all([circuits, records]);
    return {
      circuits: ret[0],
      records: ret[1],
    };
  };

  // Insert a new record in the database
  circuitModel.updateRecord = async function (
    circuitId,
    record,
    replay,
    oldRecord
  ) {
    try {
      let promises = [
        circuitModel.insertRecordAndReplay(circuitId, record, replay),
      ];
      if (oldRecord.run) {
        promises.push(circuitModel.deleteRecord(oldRecord, circuitId));
      }
      let ret = await Promise.all(promises);
      Server.infoLogging(
        "Update record",
        "success",
        record.nickname,
        circuitId
      );
      return { run: record, ranking: ret[0] };
    } catch (err) {
      Server.errorLogging("Update record", err);
    }
  };

  // Get a specific record of a specific user
  circuitModel.getUserRecord = async function (userId, circuitId) {
    let rec = await circuitModel.getUserRecords(userId, [circuitId]);
    return rec.length > 0 ? rec[0] : {};
  };

  // Get the records for a user and a set of circuits (if none, then it is all circuits)
  circuitModel.getUserRecords = async function (userId, circuitIds = []) {
    // Format the ids
    userId = circuitModel.toObjectId(userId);
    circuitIds = circuitModel.toObjectId(circuitIds);

    // Construct the query
    let req = [];
    if (circuitIds.length > 0) {
      req.push({ $match: { _id: { $in: circuitIds } } });
    }
    req.push(
      {
        $addFields: {
          ranking: {
            $indexOfArray: ["$runs._userId", userId],
          },
        },
      },
      {
        $project: {
          ranking: 1,
          run: {
            $arrayElemAt: ["$runs", "$ranking"],
          },
        },
      }
    );
    let records = await circuitModel.aggregate(req);

    // Default value if no record (ranking = -1) is a blank object for avoiding errors then
    return records.map((r) => (r.ranking < 0 ? {} : r));
  };

  // Get random phantoms according to the position of the player in the ranking of this circuit
  circuitModel.getRandomPhantoms = async function (pos, runsNumber, circuitId) {
    circuitId = circuitModel.toObjectId(circuitId);

    // 2 better and 2 worst times
    let upperRepartition = 2;
    let downRepartition = 2;
    let realUpper = Math.max(
      0,
      Math.min(
        pos,
        upperRepartition +
          Math.max(0, downRepartition - (runsNumber - (pos + 1)))
      )
    );
    let realDown = Math.min(
      runsNumber - (pos + 1),
      downRepartition + Math.max(0, upperRepartition - pos)
    );
    let indexes = [];
    while (indexes.length < realUpper) {
      let r = Functions.getRandomInt(0, pos - 1);
      if (indexes.indexOf(r) == -1) {
        indexes.push(r);
      }
    }

    // Get the random ranking positions
    while (indexes.length < realUpper + realDown) {
      let r = Functions.getRandomInt(pos + 1, runsNumber - 1);
      if (indexes.indexOf(r) == -1) {
        indexes.push(r);
      }
    }

    // Construct the query to get the replay ids from the random positions in the ranking
    let req = [];
    indexes.forEach((index) => {
      req.push({ $arrayElemAt: ["$runs", index] });
    });
    req = [
      { $match: { _id: circuitId } },
      {
        $project: {
          runs: req,
        },
      },
    ];
    let replays = (await circuitModel.aggregate(req))[0];
    let replayIds = [];
    replays.runs.forEach((r) => {
      r && replayIds.push(r._replayId);
    });

    // We have the replay ids and we we want the full replay (with all the successive positions)
    let fullReplays = await Server.ReplayModel.getReplays(replayIds);
    return fullReplays;
  };

  // Get the user replay and the random phantoms from a specified circuit
  circuitModel.getUserReplayAndPhantoms = async function (
    userRecord,
    selectedCircuit
  ) {
    let replays = [];
    let promises = [];
    if (userRecord.run && userRecord.run._replayId) {
      promises.push(Server.ReplayModel.getReplay(userRecord.run._replayId));
    }
    promises.push(
      circuitModel.getRandomPhantoms(
        !userRecord.ranking ? -1 : userRecord.ranking,
        selectedCircuit.runsNumber,
        selectedCircuit._id
      )
    );
    let ret = await Promise.all(promises);

    let playerReplay = ret[0];
    if (userRecord.run && userRecord.run._replayId && playerReplay) {
      playerReplay.nickname = "Best time";
      replays.push(playerReplay);
    }
    replays.push(...ret[ret.length - 1]);
    return replays;
  };

  // Delete one specified record
  circuitModel.deleteRecord = async function (userRecord, circuitId) {
    try {
      circuitId = circuitModel.toObjectId(circuitId);
      await Promise.all([
        Server.ReplayModel.deleteOne({ _id: userRecord.run._replayId }),
        circuitModel.updateOne(
          { _id: circuitId },
          {
            $pull: {
              runs: {
                _id: userRecord.run._id,
              },
            },
          }
        ),
      ]);
      Server.infoLogging(
        "Delete record",
        "success",
        userRecord.run.nickname,
        circuitId,
        userRecord.run._replayId
      );
    } catch (err) {
      Server.errorLogging("Delete record", err);
    }
  };
};

const { Promise } = require("mongoose");

module.exports = function (Server) {
  const UserSchema = Server.mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    email: { type: String, required: true },
    koinosAccount: { type: String, required: false },
    koinosAccountType: { type: String, required: false },
    nfts: [
      {
        nftId: { type: Number, required: true },
        nftName: { type: String, required: true },
        nftCategory: { type: String, required: true },
        nftRarity: { type: String, required: true },
        nftRawMetadata: { type: String, required: true },
        nftSelected: Boolean,
      },
    ],
    circuitVotes: [Server.mongoose.Schema.Types.ObjectId],
  });

  // Encrypting the password before saving it to the database
  UserSchema.pre("save", function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified("password")) return next();

    // generate a salt
    Server.bcrypt.genSalt(Server.saltWorkFactor, function (err, salt) {
      if (err) return next(err);

      // hash the password using our new salt
      Server.bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        // override the cleartext password with the hashed one
        user.password = hash;
        next();
      });
    });
  });

  // Encrypt the candidate and compare the two hashes
  UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    Server.bcrypt.compare(
      candidatePassword,
      this.password,
      function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
      }
    );
  };
  Server.UserModel = Server.mongoose.model("User", UserSchema);

  Server.UserModel.toObjectId = function (id) {
    return Server.mongoose.Types.ObjectId(id.toString());
  };

  Server.UserModel.getUser = async function (search) {
    let user = await Server.UserModel.findOne(search);
    return user;
  };

  Server.UserModel.upvoteCircuit = async function (socket, circuitId) {
    try {
      let circuitVoteIndex = socket.userModel.circuitVotes.findIndex(
        (el) => el.toString() == circuitId.toString()
      );
      let promises = [];
      let isUpvoted = circuitVoteIndex < 0;
      if (isUpvoted) {
        promises.push(
          Server.CircuitModel.findOneAndUpdate(
            { _id: Server.UserModel.toObjectId(circuitId) },
            { $inc: { upvotes: 1 } },
            { new: true }
          ),
          Server.UserModel.findOneAndUpdate(
            { _id: Server.UserModel.toObjectId(socket.userModel._id) },
            { $push: { circuitVotes: circuitId } },
            { new: true }
          )
        );
      } else {
        promises.push(
          Server.CircuitModel.findOneAndUpdate(
            { _id: Server.UserModel.toObjectId(circuitId) },
            { $inc: { upvotes: -1 } },
            { new: true }
          ),
          Server.UserModel.findOneAndUpdate(
            { _id: Server.UserModel.toObjectId(socket.userModel._id) },
            { $pull: { circuitVotes: circuitId } },
            { new: true }
          )
        );
      }

      let result = await Promise.all(promises);
      socket.userModel = result[1];

      Server.infoLogging(
        "Upvote circuit",
        "success",
        socket,
        circuitId,
        isUpvoted
      );
      return { isUpvoted: isUpvoted, result: result };
    } catch (err) {
      Server.errorLogging("Upvote circuit", err, socket, circuitId);
    }
  };

  Server.UserModel.deleteCircuitVotes = async function () {
    try {
      let ret = await Server.UserModel.updateMany(
        {},
        { $set: { circuitVotes: [] } }
      );
      Server.infoLogging("Delete circuit votes", "success");
      return ret;
    } catch (err) {
      Server.errorLogging("Delete circuit votes", err);
    }
  };

  // Update the NFT selection of the user. The nftSelection is an array of nftIds. If the nftId is in the array, the nft is selected, otherwise it is not. Only one nft of each category can be selected.
  // If none of the nfts of a category is in the nftSelection, then it is the default nft that is selected (treated client side).
  Server.UserModel.updateNFTSelection = async function (socket, nftSelection) {
    try {
      let nfts = socket.userModel.nfts;
      // Group selected NFTs by category
      let selectedByCategory = {};
      nftSelection.forEach((nftId) => {
        const nft = nfts.find((n) => n.nftId === nftId);
        if (nft && !selectedByCategory[nft.nftCategory]) {
          selectedByCategory[nft.nftCategory] = nftId;
        }
      });

      // Update NFT selection state - only first one per category
      nfts.forEach((nft) => {
        nft.nftSelected = selectedByCategory[nft.nftCategory] === nft.nftId;
      });

      let result = await Server.UserModel.findOneAndUpdate(
        { _id: Server.UserModel.toObjectId(socket.userModel._id) },
        { $set: { nfts: nfts } },
        { new: true }
      );

      Server.infoLogging(
        "Update NFT selection",
        "success",
        socket,
        JSON.stringify(nftSelection)
      );
      return result;
    } catch (err) {
      Server.errorLogging(
        "Update NFT selection",
        err,
        socket,
        JSON.stringify(nftSelection)
      );
    }
  };

  Server.UserModel.linkKoinosAccount = async function (
    socket,
    koinosAccount,
    koinosAccountType = null,
    nftsIds = []
  ) {
    try {
      let nfts = [];
      if (nftsIds.length > 0) {
        nfts = await Server.NftModel.find({ nftId: { $in: nftsIds } });
      }
      let result = await Server.UserModel.findOneAndUpdate(
        { _id: Server.UserModel.toObjectId(socket.userModel._id) },
        {
          $set: {
            koinosAccount: koinosAccount,
            koinosAccountType: koinosAccountType,
            nfts: nfts,
          },
        },
        { new: true }
      );

      Server.infoLogging(
        "Link Koinos account",
        "success",
        socket,
        JSON.stringify(koinosAccount)
      );
      return result;
    } catch (err) {
      Server.errorLogging("Link Koinos account", err, socket);
    }
  };

  Server.UserModel.addNFT = async function (address, nft) {
    try {
      let user = await Server.UserModel.findOne({ koinosAccount: address });
      if (!user) {
        throw new Error("User not found");
      }

      // Add it in the user's NFT list, only if it is not already there
      let nftIndex = user.nfts.findIndex((el) => el.nftId == nft.nftId);
      if (nftIndex < 0) {
        user.nfts.push(nft);
        let newUser = await user.save();
        Server.infoLogging("Add NFT", "success", address, nft.nftId);
        return newUser;
      } else {
        throw new Error("NFT already exists");
      }
    } catch (err) {
      Server.errorLogging("Add NFT", err, address, nft.nftId);
    }
  };

  Server.UserModel.deleteNFT = async function (address, nftId) {
    try {
      let user = await Server.UserModel.findOne({ koinosAccount: address });
      if (!user) {
        throw new Error("User not found");
      }

      let nftIndex = user.nfts.findIndex((el) => el.nftId == nftId);
      if (nftIndex >= 0) {
        user.nfts.splice(nftIndex, 1);
        let newUser = await user.save();
        Server.infoLogging("Delete NFT", "success", address, nftId);

        return newUser;
      } else {
        throw new Error("NFT not found for deletion");
      }
    } catch (err) {
      Server.errorLogging("Delete NFT", err, address, nftId);
    }
  };
};

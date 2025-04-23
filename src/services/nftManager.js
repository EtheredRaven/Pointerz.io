module.exports = function (Server) {
  Server.registerEvent(Server.io, "connection", function (socket) {
    // Get all NFTs
    Server.registerEvent(socket, "getNfts", async function () {
      try {
        Server.assertUserIsLoggedIn(socket);

        // Optionally add an admin check here
        // if (!socket.userModel.isAdmin) throw new Error("Admin access required");

        const nfts = await Server.NftModel.find().sort({ nftId: 1 });
        socket.emit("updateNfts", { nfts });
      } catch (err) {
        socket.emit("updateNfts", { error: err.message });
      }
    });

    // Create new NFTs
    Server.registerEvent(socket, "createNewNfts", async function (nftData) {
      try {
        Server.assertUserIsLoggedIn(socket);
        // Optionally add an admin check here

        // Validate NFT data
        if (!nftData.nftName || !nftData.nftCategory || !nftData.nftRarity) {
          throw new Error("Missing required NFT fields");
        }

        // Set copies count with default of 1
        const copiesCount = parseInt(nftData.copiesCount) || 1;
        if (copiesCount < 1 || copiesCount > 100) {
          throw new Error("Copies count must be between 1 and 100");
        }

        // Find the last NFT ID to auto-increment
        const lastNft = await Server.NftModel.findOne().sort({ nftId: -1 });
        let nextNftId = lastNft ? lastNft.nftId + 1 : 1;

        // Create the main NFT
        const mainNft = new Server.NftModel({
          _id: new Server.mongoose.Types.ObjectId(),
          nftId: nextNftId,
          nftName: nftData.nftName,
          nftCategory: nftData.nftCategory,
          nftRarity: nftData.nftRarity,
          nftMask: nftData.nftMask || false,
          nftRawMetadata: nftData.nftRawMetadata || "{}",
          nftReference: null,
        });

        await mainNft.save();

        // Create reference NFTs if copies > 1
        const createdNfts = [mainNft];
        if (copiesCount > 1) {
          const references = [];

          for (let i = 1; i < copiesCount; i++) {
            nextNftId++;
            references.push({
              _id: new Server.mongoose.Types.ObjectId(),
              nftId: nextNftId,
              nftName: nftData.nftName,
              nftCategory: nftData.nftCategory,
              nftRarity: nftData.nftRarity,
              nftMask: nftData.nftMask || false,
              nftReference: mainNft.nftId,
            });
          }

          if (references.length > 0) {
            const result = await Server.NftModel.insertMany(references);
            createdNfts.push(...result);
          }
        }

        Server.infoLogging(
          "Create NFT",
          "success",
          socket.userModel?.username,
          copiesCount
        );
        socket.emit("nftCreated", { count: createdNfts.length });
      } catch (err) {
        Server.errorLogging("Create NFT", err, socket.userModel?.username);
        socket.emit("nftCreated", { error: err.message });
      }
    });

    // Delete NFT
    Server.registerEvent(socket, "deleteNft", async function (nftId) {
      try {
        Server.assertUserIsLoggedIn(socket);
        // Optionally add an admin check here

        if (!nftId) {
          throw new Error("NFT ID is required");
        }

        // Check if other NFTs reference this one before deleting
        const referencingNfts = await Server.NftModel.find({
          nftReference: nftId,
        });
        if (referencingNfts.length > 0) {
          throw new Error(
            `Cannot delete: ${referencingNfts.length} other NFTs reference this one`
          );
        }

        const result = await Server.NftModel.deleteOne({ nftId: nftId });

        if (result.deletedCount === 0) {
          throw new Error("NFT not found");
        }

        Server.infoLogging(
          "Delete NFT",
          "success",
          socket.userModel?.username,
          nftId
        );
        socket.emit("nftDeleted", { success: true });
      } catch (err) {
        Server.errorLogging("Delete NFT", err, socket.userModel?.username);
        socket.emit("nftDeleted", { error: err.message });
      }
    });
  });
};

module.exports = function (Server) {
  var NftSchema = Server.mongoose.Schema({
    _id: Server.mongoose.Schema.Types.ObjectId,
    nftId: Number,
    nftName: String,
    nftCategory: String,
    nftRarity: String,
    nftMask: Boolean,
    nftRawMetadata: String,
    nftReference: Number,
  });
  Server.NftModel = Server.mongoose.model("Nft", NftSchema);

  Server.NftModel.getNft = async function (nftId, formatForAPI = false) {
    let ret = await Server.NftModel.findOne({ nftId: nftId });
    // If there is a reference to another NFT, get the reference because it is just a copy of the original NFT
    if (!ret) return null;
    if (ret.nftReference) {
      let ref = await Server.NftModel.getNft(ret.nftReference);
      ret = { ...ref.toObject(), ...ret.toObject() }; // Overwrite the reference with the actual NFT
    }
    if (formatForAPI) {
      const rawMetadata = JSON.parse(ret.nftRawMetadata || "{}");
      const metadataAttributes = Object.entries(rawMetadata).map(
        ([key, value]) => ({
          trait_type: key,
          value: value,
        })
      );
      ret = {
        id: ret.nftId,
        name: ret.nftName,
        description: "Pointerz NFTs",
        attributes: [
          {
            trait_type: "Category",
            value: ret.nftCategory,
          },
          {
            trait_type: "Rarity",
            value: ret.nftRarity,
          },
          ...metadataAttributes,
        ],
        image: `https://pointerz.io/assets/images/spaceships/${ret.nftCategory}/${ret.nftName}.png`,
        reference: ret.nftReference || undefined,
      };
    }
    return ret;
  };
};

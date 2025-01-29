const express = require("express");
module.exports = function (Server) {
  Server.app.use("/", express.static(__dirname + "/public"));

  Server.app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
  });

  Server.app.get("/api/get_nft_metadata/:tokenId", async function (req, res) {
    const { tokenId } = req.params;

    try {
      // Input validation
      if (!tokenId || isNaN(tokenId)) {
        throw new Error("Invalid token id");
      }

      // Single NFT fetch
      const nft = await Server.NftModel.getNft(tokenId, true);
      if (!nft) {
        throw new Error("NFT not found");
      }

      // Success logging and response
      Server.infoLogging("get_nft_metadata", "", "success", tokenId);
      return res.json(nft);
    } catch (error) {
      // Error logging
      Server.errorLogging("get_nft_metadata", "", error.message, tokenId);

      // Error response
      return res
        .status(error.message === "NFT not found" ? 404 : 400)
        .json({ error: error.message });
    }
  });
};

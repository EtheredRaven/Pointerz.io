const express = require("express");
module.exports = function (Server) {
  Server.app.use("/", express.static(__dirname + "/public"));
  Server.app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
  });
  Server.app.get("/api/get_nft_metadata/:tokenId", async function (req, res) {
    if (!req.params.tokenId || isNaN(req.params.tokenId)) {
      return res.status(400).send({ error: "Invalid token id" });
    }
    let ret = await Server.NftModel.getNft(req.params.tokenId, true);
    if (!ret) {
      return res.status(404).send({ error: "NFT not found" });
    }
    return res.send(await Server.NftModel.getNft(req.params.tokenId, true));
  });
};

const { Contract, Provider, utils } = require("koilib");
const pointerzNFTsAbi = require("./abi/pointerzNFTsAbi.json");
const kanvasContractAbi = require("./abi/kanvasAbi.json");
const { Client } = require("koinos-rpc");

module.exports = async function (Server, reverseProviders = false) {
  !Server.PROVIDERS_URL &&
    (Server.PROVIDERS_URL = [
      "https://api.koinosblocks.com",
      "https://api.koinos.io",
    ]);
  if (reverseProviders) {
    Server.PROVIDERS_URL.reverse();
  }
  Server.provider = new Provider(Server.PROVIDERS_URL); // koilib
  Server.client = new Client(Server.PROVIDERS_URL); // koinos-rpc
  Server.kanvasContractAddress = "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS";
  Server.koinContractAddress = "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL";
  Server.pointerzNFTsContractAddress = "1PointZMeXuvmCGxpUp7J7PN5tejRH6daw";

  Server.initContractWithSigner = (contractAddress, signer) => {
    let abi;
    if (contractAddress === Server.pointerzNFTsContractAddress) {
      abi = pointerzNFTsAbi;
    } else if (contractAddress === Server.kanvasContractAddress) {
      abi = kanvasContractAbi;
    } else {
      abi = utils.tokenAbi;
    }

    let contractArgs = {
      id: contractAddress,
      abi: abi,
      provider: Server.provider,
    };
    if (signer) {
      signer.provider = Server.provider;
      contractArgs.signer = signer;
    }
    return new Contract(contractArgs);
  };
};

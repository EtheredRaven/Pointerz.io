const { Signer, Transaction } = require("koilib");
const CryptoJS = require("crypto-js");
const kondor = require("kondor-js");
const wif = require("wif");

module.exports = function (Client) {
  Client.getCryptoAccountStorageName = function (userModel) {
    return "pointerz-" + userModel.username + "-" + userModel.koinosAccount;
  };

  Client.tryToOpenKondor = async function () {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 500)
      );

      const checkKondor = kondor.getProvider().getChainId();

      await Promise.race([checkKondor, timeout]);
      return true;
    } catch (error) {
      return false;
    }
  };

  Client.getPointerzNFTContractWithSigner = function (userModel) {
    let signer;
    if (userModel.koinosAccountType == "Kondor") {
      try {
        signer = kondor.getSigner(userModel.koinosAccount);
      } catch (error) {
        throw new Error("Invalid Kondor account: " + error.message);
      }
      if (!signer) {
        throw new Error("Invalid Kondor account");
      }
    } else {
      let cryptoAccount = JSON.parse(
        window.localStorage.getItem(
          Client.getCryptoAccountStorageName(userModel)
        ) || "{}"
      );

      if (cryptoAccount.privateKey || userModel.privateKey) {
        if (userModel.privateKey) {
          cryptoAccount.privateKey = userModel.privateKey;
        } else {
          cryptoAccount.privateKey = CryptoJS.AES.decrypt(
            cryptoAccount.privateKey,
            userModel.password
          ).toString(CryptoJS.enc.Utf8);
        }

        try {
          cryptoAccount.privateKey = wif.decode(
            cryptoAccount.privateKey
          ).privateKey;
          let newSigner = new Signer({ privateKey: cryptoAccount.privateKey });

          if (newSigner.address != userModel.koinosAccount) {
            throw new Error("Invalid private key");
          }
          signer = newSigner;

          if (userModel.privateKey) {
            Client.storeCryptoAccount(
              userModel.koinosAccount,
              userModel.privateKey,
              userModel.username,
              userModel.password
            );
          }
        } catch (error) {
          throw new Error("Invalid private key: " + error.message);
        }
      } else {
        let enteredPrivateKey = window.prompt(
          "Your private key is not stored on this device. Please enter it here:",
          ""
        );
        if (!enteredPrivateKey) {
          throw new Error("No private key entered");
        }
        try {
          enteredPrivateKey = wif.decode(enteredPrivateKey).privateKey;
          let newSigner = new Signer({ privateKey: enteredPrivateKey });
          if (newSigner.address != userModel.koinosAccount) {
            throw new Error(
              "The private key does not match the linked account"
            );
          }
          signer = newSigner;
          Client.storeCryptoAccount(
            userModel.koinosAccount,
            enteredPrivateKey,
            userModel.username,
            userModel.password
          );
        } catch (error) {
          throw new Error("Invalid private key: " + error.message);
        }
      }
    }

    if (signer) {
      return Client.initContractWithSigner(
        Client.pointerzNFTsContractAddress,
        signer
      );
    }
  };

  Client.unlockCryptoAccount = function (userModel) {
    if (!userModel || !userModel.koinosAccount || !userModel.username) {
      Client.pointerzNFTContract = undefined;
      return {};
    }

    try {
      let contract = Client.getPointerzNFTContractWithSigner(userModel);
      contract && (Client.pointerzNFTContract = contract);
    } catch (error) {
      return { retError: error };
    }
  };

  Client.storeCryptoAccount = function (
    address,
    privateKey,
    username,
    password
  ) {
    let cryptoAccount = {
      username: username,
      address: address,
      privateKey: CryptoJS.AES.encrypt(privateKey, password).toString(),
    };

    window.localStorage.setItem(
      Client.getCryptoAccountStorageName({
        username: username,
        koinosAccount: address,
      }),
      JSON.stringify(cryptoAccount)
    );
  };

  Client.unlinkCryptoAccount = function (userModel) {
    let storageName = Client.getCryptoAccountStorageName(userModel);
    window.localStorage.removeItem(storageName);
  };

  Client.signAndSendTransaction = async function (
    functionName,
    args,
    contract = Client.pointerzNFTContract
  ) {
    if (!contract || !contract.signer) {
      throw new Error("No signer available");
    }

    const { operation } = await contract.functions[functionName](args, {
      onlyOperation: true,
    });

    const tx = new Transaction({
      signer: contract.signer,
      provider: contract.provider,
      options: {
        payer: Client.kanvasContractAddress,
        payee: contract.signer.getAddress(),
        rcLimit: 200000000,
      },
    });

    let randomSigner = Client.getRandomPrivateKey(true);

    await tx.pushOperation(operation);
    await tx.prepare();
    await randomSigner.signTransaction(tx.transaction); // <-- If I let this lign, the error is thrown when trying to sign via Kondor afterwards
    await tx.sign();
    await tx.send();

    return tx.transaction;
  };

  Client.signAndSendLinkAccountTransaction = async function (
    koinosAddress,
    pointerzUsername,
    contract = Client.pointerzNFTContract
  ) {
    let ret = await Client.signAndSendTransaction(
      "link_account",
      {
        from: koinosAddress,
        to: pointerzUsername,
      },
      contract
    );
    return ret;
  };

  Client.getRandomPrivateKey = function (getSigner = false) {
    const tempPrivateKey = new Uint8Array(32);
    window.crypto.getRandomValues(tempPrivateKey);
    const signer = new Signer({ privateKey: tempPrivateKey, compressed: true });
    return getSigner ? signer : signer.getPrivateKey("wif");
  };
};

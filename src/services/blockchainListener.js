module.exports = async function (Server) {
  const BLOCKS_PROCESSING_INTERVAL = 1000;
  Server.pointerzNFTsContract = Server.initContractWithSigner(
    Server.pointerzNFTsContractAddress
  );

  let processEvent = async function (event, txId) {
    if (event.source != Server.pointerzNFTsContractAddress) return;

    let contract = Server.pointerzNFTsContract;
    const eventDecoded = await contract.decodeEvent(event);
    let eventArgs = eventDecoded.args;
    Server.infoLogging(
      "New transaction to process",
      "",
      eventDecoded.name,
      txId,
      JSON.stringify(eventArgs)
    );

    if (event.source == Server.pointerzNFTsContractAddress) {
      if (eventDecoded.name == "collections.transfer_event") {
        let hexAsciiToInteger = function (hexAscii) {
          const hexValue = hexAscii.startsWith("0x")
            ? hexAscii.slice(2)
            : hexAscii;
          let asciiString = "";
          for (let i = 0; i < hexValue.length; i += 2) {
            asciiString += String.fromCharCode(
              parseInt(hexValue.substr(i, 2), 16)
            );
          }

          return parseInt(asciiString, 10);
        };

        let nftId = hexAsciiToInteger(eventArgs.token_id);
        let nftDetails = await Server.NftModel.getNft(nftId);
        if (nftDetails) {
          // If the NFT is in the database
          Server.UserModel.addNFT(eventArgs.to, nftDetails);
          Server.UserModel.deleteNFT(eventArgs.from, nftId);
          Server.infoLogging(
            "NFT transferred",
            "",
            nftId,
            eventArgs.from,
            eventArgs.to
          );
        } else {
          Server.errorLogging("NFT not found", "", nftId, eventArgs.token_id);
        }
      } else if (eventDecoded.name == "collections.account_linked_event") {
        let linkingFunction = Server.accountsWaitingForLink[eventArgs.from];
        if (linkingFunction) {
          Server.infoLogging(
            "Account linked",
            "",
            eventArgs.from,
            eventArgs.to
          );
          linkingFunction(eventArgs.to, eventArgs.token_id); // async function
          delete Server.accountsWaitingForLink[eventArgs.from];
        }
      }
    }
  };

  Server.processBlocks = async function (blocksToProcess) {
    // Process the block in the right order
    for (let i = blocksToProcess.length - 1; i >= 0; i--) {
      let block = blocksToProcess[i];

      // Server.infoLogging("New block", "", block.block_height, block.block_id);

      // Process the events
      let transactionReceipts = block.receipt.transaction_receipts;
      let receiptId = block.receipt.id;
      if (transactionReceipts) {
        for (let j = 0; j < transactionReceipts.length; j++) {
          let txReceipt = transactionReceipts[j];
          let events = txReceipt.events;
          if (events) {
            for (let k = 0; k < events.length; k++) {
              // Process each event
              let event = events[k];
              await processEvent(event, receiptId);
            }
          }
        }
      }

      // Process the transactions and operations
      let blockTransactions = block.block.transactions;
      if (blockTransactions) {
        for (let j = 0; j < blockTransactions.length; j++) {
          let transaction = blockTransactions[j];
          let txOperations = transaction.operations;
          for (let k = 0; k < txOperations.length; k++) {
            let txOperation = txOperations[k];
            //await processOperation(txOperation);
          }
        }
      }
    }
  };

  // Check for events in the new blocks and process them
  let lastBlockHeight = Number(
    (await Server.client.blockStore.getHighestBlock()).topology.height
  );
  setInterval(async () => {
    if (Server.TEST_ENV) return true;
    try {
      let newBlock = (await Server.client.blockStore.getHighestBlock())
        .topology;
      let newBlockHeight = Number(newBlock.height);
      let blocksToProcess = [];

      // Construct all the missed blocks in this interval to process
      if (newBlockHeight >= lastBlockHeight) {
        let currentBlockHeight = newBlockHeight;
        let currentBlockId = newBlock.id;

        while (currentBlockHeight >= lastBlockHeight) {
          const { block_items } =
            await Server.client.blockStore.getBlocksByHeight(
              currentBlockId,
              currentBlockHeight,
              1
            );

          blocksToProcess.push(block_items[0]);
          currentBlockId = block_items[0].block.header.previous;
          currentBlockHeight--;
        }

        lastBlockHeight = newBlockHeight + 1;
      }

      // Process the blocks
      await Server.processBlocks(blocksToProcess);
    } catch (err) {
      Server.errorLogging("Processing block", "", err);
    }
  }, BLOCKS_PROCESSING_INTERVAL);
};

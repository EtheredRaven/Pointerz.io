<script>
  import { infoError, infoInfo, userModel, Client } from "../../misc/store";
  import PointerzButton from "./PointerzButton.svelte";
  import PointerzModal from "./PointerzModal.svelte";
  import PointerzConfirm from "./PointerzConfirm.svelte";
  import PointerzInput from "./PointerzInput.svelte";
  import * as kondor from "kondor-js";
  import * as wif from "wif";

  let openGenerateWalletModal;
  let privatekeyGenerated;
  let privateKey;
  let pastedPrivateKey;

  function resetModal() {
    openGenerateWalletModal = false;
    privatekeyGenerated = false;
    pastedPrivateKey = "";
    privateKey = "";
  }

  resetModal();

  $: connectedKoinosAccount = $userModel.koinosAccount;

  async function tryToConnectKondorAccount() {
    let hasKondor = await Client.tryToOpenKondor();
    if (!hasKondor) {
      openGenerateWalletModal = true;
      return;
    }

    let accounts = await kondor.getAccounts();
    if (!accounts || accounts.length == 0) {
      $infoError = "No Koinos account selected";
      return;
    }
    let accountToLink = accounts[0];
    try {
      let tempContractWithSigner = Client.getPointerzNFTContractWithSigner({
        koinosAccountType: "Kondor",
        koinosAccount: accountToLink.address,
      });
      await Client.signAndSendLinkAccountTransaction(
        accountToLink.address,
        $userModel.username,
        tempContractWithSigner
      );
      Client.socket.emitLinkKoinosAccount(accountToLink.address, "Kondor"); // Send the address to the server for it to listen to the transactions
      $infoInfo =
        "Transaction sent to link your Koinos account, please wait a few seconds for it to be confirmed!";
    } catch (e) {
      $infoError = e;
    }
  }

  async function unlinkKoinosAccount() {
    Client.unlinkCryptoAccount($userModel);
    Client.socket.emitLinkKoinosAccount(null);
  }

  async function tryToLinkPKAccount() {
    if (!privateKey) {
      $infoError = "Please paste your private key";
      return false;
    }
    if (privatekeyGenerated && privateKey != pastedPrivateKey) {
      $infoError =
        "Private keys don't match. Please store your private key somewhere safe!";
      return false;
    }

    try {
      let address = getPublicKeyFromPrivateKey(privateKey);
      let tempContractWithSigner = Client.getPointerzNFTContractWithSigner({
        koinosAccountType: "PK",
        koinosAccount: address,
        username: $userModel.username,
        password: $userModel.password,
        privateKey: privateKey,
      });
      await Client.signAndSendLinkAccountTransaction(
        address,
        $userModel.username,
        tempContractWithSigner
      );
      Client.socket.emitLinkKoinosAccount(address, "PK");
      $infoInfo =
        "Transaction sent to link your Koinos account, please wait a few seconds for it to be confirmed!";
      resetModal();
      return true;
    } catch (e) {
      $infoError = e;
      return false;
    }
  }

  function reduceAddress(address) {
    return address.slice(0, 6) + "..." + address.slice(-6);
  }

  function copyPrivateKey() {
    navigator.clipboard.writeText(privateKey);
    $infoInfo = "Private key copied to clipboard";
  }

  function copyAddressFromUserModel() {
    navigator.clipboard.writeText($userModel.koinosAccount);
    $infoInfo = "Address copied to clipboard";
  }

  function generatePrivateKey() {
    privateKey = Client.getRandomPrivateKey();
    privatekeyGenerated = true;
  }

  function getPublicKeyFromPrivateKey(privateKey) {
    // Private key is in WIF format, convert it to hex
    privateKey = wif.decode(privateKey).privateKey;
    const signer = new Signer({ privateKey });
    return signer.address;
  }
</script>

<div class="pointerzButtonCointainer">
  {#if connectedKoinosAccount}
    <PointerzButton
      buttonColor="darkGrey"
      imagePath="assets/images/menu/copy.png"
      imageOnly={true}
      noSound
      on:click={copyAddressFromUserModel} />
    <PointerzConfirm
      let:confirm={confirmThis}
      confirmTitle="Unlink"
      cancelTitle="Cancel">
      <PointerzButton
        buttonColor="darkGrey"
        imagePath="assets/images/menu/unlink.png"
        imageOnly={true}
        noSound
        on:click={() => confirmThis(unlinkKoinosAccount)} />
      <span slot="title"> Unlink your Koinos account? </span>
      <span slot="description"
        >Do you really want to unlink your Koinos account ? Please make sure you
        have your private key stored somewhere safe! We won't be able to recover
        it for you since we don't store it on our servers.</span>
    </PointerzConfirm>
    <PointerzButton buttonColor="darkGrey" important clickable={false}
      >{reduceAddress(connectedKoinosAccount)}</PointerzButton>
  {:else}
    <PointerzButton
      buttonColor="darkGrey"
      important
      on:click={tryToConnectKondorAccount}>Connect Koinos</PointerzButton>
    <PointerzModal
      bind:showDialog={openGenerateWalletModal}
      color="darkGrey"
      confirmTitle="Link account"
      confirmFunction={tryToLinkPKAccount}
      canCancel={false}>
      <span slot="title">Generate a Koinos account</span>
      <span slot="description">
        <div class="paragraph">
          ℹ️ You can generate a Koinos account using the button down below or
          paste your own private key.
        </div>
        <div class="flex margin-top">
          <div class="flex-auto">
            <PointerzInput
              type="text"
              bind:value={privateKey}
              placeholder="Private key" />
          </div>
          <span class="copyKey" on:click={copyPrivateKey}>
            <svg
              width="48px"
              height="48px"
              viewBox="0 -0.5 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.94605 4.99995L13.2541 4.99995C14.173 5.00498 15.0524 5.37487 15.6986 6.02825C16.3449 6.68163 16.7051 7.56497 16.7001 8.48395V12.716C16.7051 13.6349 16.3449 14.5183 15.6986 15.1717C15.0524 15.825 14.173 16.1949 13.2541 16.2H8.94605C8.02707 16.1949 7.14773 15.825 6.50148 15.1717C5.85522 14.5183 5.495 13.6349 5.50005 12.716L5.50005 8.48495C5.49473 7.5658 5.85484 6.6822 6.50112 6.0286C7.1474 5.375 8.0269 5.00498 8.94605 4.99995Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round" />
              <path
                d="M10.1671 19H14.9371C17.4857 18.9709 19.5284 16.8816 19.5001 14.333V9.666"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </span>
        </div>
        {#if privatekeyGenerated}
          <div class="paragraph">
            ⚠️ You have generated a new private key for a Koinos account! Make
            sure to write it somewhere safe! We won't be able to recover it for
            you since we don't store it on our servers.
          </div>
          <PointerzInput
            type="text"
            bind:value={pastedPrivateKey}
            placeholder="Paste your generated private key to verify!" />
        {:else}
          <div class="paragraph">
            You can generate a Koinos account using the button down below or
            paste your own private key.
          </div>
          <PointerzButton
            buttonColor="darkBlue"
            important
            on:click={generatePrivateKey}>
            <svg
              fill="#dddbdb"
              viewBox="0 0 24 24"
              style="width: 28px; height: 28px;vertical-align: middle;margin-right: 8px;"
              xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  id="primary"
                  d="M4,12A8,8,0,0,1,18.93,8"
                  style="
            fill: none;
            stroke: #dddbdb;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-width: 2;
          "></path>
                <path
                  id="primary-2"
                  data-name="primary"
                  d="M20,12A8,8,0,0,1,5.07,16"
                  style="
            fill: none;
            stroke: #dddbdb;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-width: 2;
          "></path>
                <polyline
                  id="primary-3"
                  data-name="primary"
                  points="14 8 19 8 19 3"
                  style="
            fill: none;
            stroke: #dddbdb;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-width: 2;
          "></polyline>
                <polyline
                  id="primary-4"
                  data-name="primary"
                  points="10 16 5 16 5 21"
                  style="
            fill: none;
            stroke: #dddbdb;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-width: 2;
          "></polyline>
              </g>
            </svg>Generate a new account
          </PointerzButton>
        {/if}
      </span>
    </PointerzModal>
  {/if}
</div>

<style>
  .pointerzButtonCointainer {
    position: absolute;
    top: 8px;
    right: 8px;
    display: grid;
    grid-auto-flow: column;
    grid-gap: 12px;
    border-radius: 8px;
    padding: 10px;
    z-index: 1;
  }

  .flex {
    display: flex;
  }

  .flex-auto {
    flex: auto;
  }

  .copyKey {
    cursor: pointer;
    margin-left: 8px;
  }

  .margin-top {
    margin-top: 12px;
  }

  .paragraph {
    margin-bottom: 20px;
    margin-top: 16px;
  }
</style>

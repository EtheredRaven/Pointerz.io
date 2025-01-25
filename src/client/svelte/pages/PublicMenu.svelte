<script>
  // The public part of the game (logging in, signing etc...)
  import {
    infoError,
    infoInfo,
    Client,
    userModel,
    loggedIn,
    passedData,
    playerName,
    playerMail,
    playerPassword,
    playerNameMaxChar,
  } from "../misc/store";
  import { css } from "../misc/css";

  import { fade } from "svelte/transition";

  import AppLayout from "./AppLayout.svelte";
  import PointerzButton from "../components/ui/PointerzButton.svelte";
  import FlexContainer from "../components/ui/FlexContainer.svelte";
  import PointerzInput from "../components/ui/PointerzInput.svelte";
  import Cell from "../components/ui/Cell.svelte";

  // Local subrouter
  const SUBPAGES = {
    PLAY_AS_ANONYMOUS: 1,
    REGISTERED_LOG_IN: 2,
    SIGN_IN: 3,
  };
  let currentSubpage = SUBPAGES.PLAY_AS_ANONYMOUS;

  function showSigninForm() {
    $playerPassword = "";
    $playerMail = "";
    currentSubpage = SUBPAGES.SIGN_IN;
  }

  function showLoginForm() {
    currentSubpage = SUBPAGES.REGISTERED_LOG_IN;
  }

  // The action of logging in => send the event
  function logIn(anonymous) {
    localStorage.setItem("pointerz_username", $playerName); // Update the stored name
    $playerName = $playerName
      ? $playerName.substring(0, playerNameMaxChar)
      : "Anonymous Spaceship"; // Format it
    Client.socket.logIn($playerName, $playerPassword, anonymous);
  }

  // Indeed logged in, server sent back the circuits and the records
  Client.svelte.loggedIn = function ({
    retError,
    retInfo,
    circuits,
    editorCircuits,
    voteCircuits,
    records,
    user,
    anonymous,
  }) {
    $infoError = retError;
    if (!retError) {
      $loggedIn = !anonymous; // This is only a local variable as an indicator to know if the user is anonymous or not, the server handles the rest
      $userModel = user;
      $passedData = {
        circuits: circuits,
        records: records,
        editorCircuits: editorCircuits,
        voteCircuits: voteCircuits,
      };
      $loggedIn
        ? Client.pushRoute("/privatemenu")
        : Client.pushRoute("/campaignmenu");
    }
  };

  // The action of signing in
  function signIn() {
    $playerName = $playerName.substring(0, playerNameMaxChar);
    Client.socket.signIn($playerName, $playerMail, $playerPassword);
  }

  // If signed in, show the info / error and go to log-in page with the user name pre-entered
  Client.svelte.signedIn = function ({ retError, retInfo }) {
    $infoError = retError;
    $infoInfo = retInfo;
    if (retInfo) {
      currentSubpage = SUBPAGES.REGISTERED_LOG_IN;
    }
  };
</script>

<AppLayout>
  <div in:fade={{ delay: 400, duration: 400 }} out:fade={{ duration: 400 }}>
    <Cell
      style="
      min-width:{css.publicMenu.minWidth}px;
      max-width:{css.publicMenu.maxWidth}px;
      display: inline-block;
    "
      noMargin>
      <Cell>
        <PointerzInput
          placeholder="Nickname"
          maxlength={playerNameMaxChar}
          bind:value={$playerName} />
        {#if currentSubpage == SUBPAGES.SIGN_IN}
          <PointerzInput
            type="mail"
            placeholder="Email"
            bind:value={$playerMail} />
        {/if}
        {#if currentSubpage == SUBPAGES.SIGN_IN || currentSubpage == SUBPAGES.REGISTERED_LOG_IN}
          <PointerzInput
            type="password"
            placeholder="Password"
            bind:value={$playerPassword} />
        {/if}
        {#if currentSubpage == SUBPAGES.PLAY_AS_ANONYMOUS}
          <PointerzButton multicolor important on:click={() => logIn(true)}>
            Play
          </PointerzButton>
        {:else if currentSubpage == SUBPAGES.REGISTERED_LOG_IN}
          <PointerzButton multicolor important on:click={() => logIn(false)}>
            Log in
          </PointerzButton>
        {:else if currentSubpage == SUBPAGES.SIGN_IN}
          <PointerzButton multicolor important on:click={() => signIn(false)}>
            Sign in
          </PointerzButton>
        {/if}
      </Cell>
      <Cell>
        <FlexContainer>
          <PointerzButton
            imagePath="assets/images/menu/log.png"
            buttonColor="grey"
            on:click={showLoginForm}
            elementsPerRow="2"
            important
            animating
            futuristic>
            Log in
          </PointerzButton>
          <PointerzButton
            imagePath="assets/images/menu/signup.png"
            buttonColor="grey"
            on:click={showSigninForm}
            elementsPerRow="2"
            lastElementOfRow
            important
            animating>
            Sign up
          </PointerzButton>
        </FlexContainer>
      </Cell>
      <!--<Cell>
        <PointerzButton
          buttonColor="blue"
          imagePath="assets/images/connection/facebook-logo.png">
          Facebook account
        </PointerzButton>
        <PointerzButton
          buttonColor="red"
          imagePath="assets/images/connection/google-logo.png">
          Google account
        </PointerzButton>
      </Cell>-->
    </Cell>
  </div>
</AppLayout>

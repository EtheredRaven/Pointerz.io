<script>
  // Main menu with the circuit list when logged in
  import { slide, fly, fade } from "svelte/transition";
  import {
    Client,
    loadedCircuits,
    userModel,
    passedData,
    loggedIn,
  } from "../misc/store";
  import { css } from "../misc/css";
  import AppLayout from "./AppLayout.svelte";
  import PointerzButton from "../components/ui/PointerzButton.svelte";
  import Cell from "../components/ui/Cell.svelte";
  import PointerzTable from "../components/ui/PointerzTable.svelte";
  import ParametersButtons from "../components/ui/ParametersButtons.svelte";
  import OfflineRedirect from "../components/ui/OfflineRedirect.svelte";
  import SelectionGrid from "../components/ui/SelectionGrid.svelte";

  function formatCircuitStats(circuit) {
    return {
      ranking: {
        svg: `<svg
              version="1.0"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              width="16px"
              height="16px"
              viewBox="0 0 64 64"
              enable-background="new 0 0 64 64"
              xml:space="preserve">
              <path
              fill="currentColor"
              d="M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16
c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8
V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z
M8,16v-4h8v12C11.582,24,8,20.414,8,16z M56,16c0,4.414-3.582,8-8,8V12h8V16z" />`,
        text: circuit.userRecord
          ? `TOP ${circuit.userRecord.ranking + 1}`
          : "Not completed",
      },
      time: circuit.userRecord
        ? {
            svg: `<svg
            fill="currentColor"
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style="margin-right: -4px;margin-top: -1px;">
            <path d="M4,14a8,8,0,1,0,8-8A8,8,0,0,0,4,14Zm7-4.8a1,1,0,0,1,2,0V13h3a1,1,0,0,1,0,2H12a1,1,0,0,1-1-1ZM8,4A1,1,0,0,1,8,2h8a1,1,0,0,1,0,2Z" />
          </svg>`,
            text: Client.race.Functions.msToTime(
              circuit.userRecord.run.runTime,
              2
            ),
          }
        : null,
    };
  }

  let selectedCircuitIndex = -1; // The selected circuit
  let recordsTableColumns = [
    {
      name: "formattedRanking",
      style:
        "font-size: 14px;width: fit-content;padding:4px;width:34px;padding-left:8px;",
    },
    {
      name: "nickname",
      style: "font-size: 18px;font-family: 'Nunito Bold';padding:4px;",
    },
    {
      name: "formattedRunTime",
      style:
        "text-align: right;font-style: italic;font-size: 16px;width: 84px; vertical-align: bottom;padding:4px;padding-right:8px;",
    },
  ];

  // Update the selected circuit index
  function selectCircuit(i) {
    Client.phaser.playSound("buttonSelection");
    selectedCircuitIndex = i;
  }

  // Join the selected circuit
  function joinRace() {
    if (Client.race.user) {
      // If there is already a current race going on, it is not possible
      return;
    }

    Client.pushRoute("/race");

    // Ask to the server the race data
    Client.socket.emitJoinNewRoom($loadedCircuits[selectedCircuitIndex]._id);
  }

  // Update the display according to the new records, triggered when logged in and when asked for updating records
  Client.svelte.updateRecordsDisplay = function (circuits, records) {
    if (!records || !circuits) {
      return;
    }
    $loadedCircuits = [...circuits];
    // Add the records to the circuits
    $loadedCircuits.forEach((circuit, i) => {
      let recordForCircuit =
        i < records.length && records[i].run ? records[i] : undefined;
      if (recordForCircuit) {
        // If there is a record by the user
        circuit.userRecord = recordForCircuit; // Add the user record to the circuit object for easier understanding
        if (
          !circuit.runs.filter((run) => run._userId == $userModel._id).length
        ) {
          // If there is no record by this user in the five best times, add it to the table
          recordForCircuit.run.formattedRanking = recordForCircuit.ranking + 1;
          circuit.runs.push(recordForCircuit.run);
        }
      }

      if (circuit.rankingFormatted) return;
      circuit.rankingFormatted = true;
      circuit.runs.forEach((globalRecord, j) => {
        if (globalRecord._userId == $userModel._id) {
          // Highlight the user record in the list
          globalRecord.highlighted = true;
        }
        if (!globalRecord.formattedRanking) {
          // Add the ranking
          globalRecord.formattedRanking = j + 1;
        }
        // Format the whole for displaying
        globalRecord.formattedRanking =
          globalRecord.formattedRanking +
          "<sup>" +
          Client.getSupFromNumber(globalRecord.formattedRanking) +
          "</sup>";
        globalRecord.formattedRunTime = Client.race.Functions.msToTime(
          globalRecord.runTime,
          3
        );
      });
    });
  };

  Client.svelte.updateRecordsDisplay($passedData.circuits, $passedData.records); // Update the records according to tge data sent during the logging in
</script>

<AppLayout>
  <OfflineRedirect />
  <div
    class="container"
    in:fly={{ delay: 400, duration: 400 }}
    out:fade={{ duration: 400 }}>
    <ParametersButtons backHref="/privatemenu" showBackButton={$loggedIn} />

    <div class="content-grid">
      <div class="circuits-column">
        <SelectionGrid
          items={$loadedCircuits.map((circuit, i) => ({
            ...circuit,
            number: i + 1,
            name: `Circuit ${i + 1}`,
            stats: formatCircuitStats(circuit),
            id: i,
          }))}
          bind:selectedId={selectedCircuitIndex}
          title="Campaign Circuits"
          titleColor="darkOrange"
          titleIcon="assets/images/menu/circuit.png"
          getItemId={(item) => item.number - 1}
          on:select={({ detail }) => selectCircuit(detail.item.number - 1)} />
      </div>

      <div class="details-column">
        <Cell
          title="Leaderboard"
          color="darkBlue"
          titleImagePath="assets/images/menu/trophy.png">
          {#if selectedCircuitIndex >= 0}
            <div class="leaderboard-container" transition:slide>
              <PointerzTable
                bind:values={$loadedCircuits[selectedCircuitIndex].runs}
                columns={recordsTableColumns}
                highlightedStyle="background:var(--blue-shadow-color);color:var(--white-color);" />
            </div>
            <div class="buttonContainer">
              <PointerzButton
                buttonColor="darkBlue"
                important
                elementsPerRow="1"
                on:click={joinRace}>
                Start
                <span class="arrowContainer">
                  <svg
                    width="32px"
                    height="43px"
                    viewBox="0 0 66 43"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g
                      id="arrow"
                      stroke="none"
                      stroke-width="1"
                      fill="none"
                      fill-rule="evenodd">
                      <path
                        class="one"
                        d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z"
                        fill="var(--almost-white-color)" />
                      <path
                        class="two"
                        d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z"
                        fill="var(--almost-white-color)" />
                      <path
                        class="three"
                        d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.6958657,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427 -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z"
                        fill="var(--almost-white-color)" />
                    </g>
                  </svg>
                </span>
              </PointerzButton>
            </div>
          {:else}
            <div class="no-selection">Select a circuit to view details</div>
          {/if}
        </Cell>
      </div>
    </div>
  </div>
</AppLayout>

<style>
  .container {
    padding: 12px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    margin-top: 2rem;
  }

  .leaderboard-container {
    padding: 1rem;
    background: var(--over-container-blocks-bg);
    border-radius: 8px;
    color: var(--almost-white-color);
  }

  .no-selection {
    text-align: center;
    padding: 12px;
    background: var(--over-container-blocks-bg);
    border-radius: 8px;
    color: var(--almost-white-color);
    font-family: "Nunito";
    font-size: 16px;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(5px);
    }
  }

  @media (max-width: 1200px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  .arrowContainer {
    position: absolute;
    right: 0px;
    top: -8px;
  }

  path.two {
    transition: 0.5s;
    transform: translateX(30%);
  }

  path.three {
    transition: 0.5s;
    transform: translateX(60%);
  }

  .buttonContainer:hover path.three {
    transform: translateX(0%);
    animation: color_anim 1s infinite 0.2s;
  }

  .buttonContainer:hover path.one {
    animation: color_anim 1s infinite 0.6s;
  }

  .buttonContainer:hover path.two {
    transform: translateX(0%);
    animation: color_anim 1s infinite 0.4s;
  }

  .buttonContainer {
    margin-top: 16px;
  }

  /* SVG animations */

  @keyframes color_anim {
    0% {
      fill: var(--almost-white-color);
    }
    50% {
      fill: var(--yellow-color);
    }
    100% {
      fill: var(--almost-white-color);
    }
  }
</style>

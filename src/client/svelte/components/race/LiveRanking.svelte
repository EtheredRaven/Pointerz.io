<script>
  // The live ranking tab component
  import { Client } from "../../misc/store";
  import { fade } from "svelte/transition";
  import PointerzTable from "../ui/PointerzTable.svelte";
  let liveRankingValues = [];
  let liveRankingTableColumns = [
    {
      name: "ranking",
      style: "font-size: 20px;width: 24px;font-family:virgo",
    },
    {
      name: "nickname",
      style: "font-size: 14px;font-family: 'Nunito Bold';",
    },
    {
      name: "formattedRunTime",
      style:
        "text-align: right;font-style: italic;font-size: 14px;width: 74px;vertical-align:middle;",
    },
  ];

  // Updating the live ranking with the data for the players in competition, ranked by time
  Client.svelte.updateLiveRanking = function (competitors) {
    let firstPlayer = competitors[0];
    let temp = [];
    for (var i = 0; i < competitors.length; i++) {
      let c = competitors[i];
      let timeDiff;
      if (c == firstPlayer) {
        // If it's the number one, then just display its last know time at the last cp crossed
        timeDiff = Client.race.Functions.msToTime(
          c.liveCheckpointsCrossed.length
            ? c.liveCheckpointsCrossed[c.liveCheckpointsCrossed.length - 1]
                .instant
            : 0,
          3
        );
      } else {
        if (!c.liveCheckpointsCrossed.length) {
          // If this player didn't cross any cp, then display the difference with the first cp of the first player
          timeDiff =
            Client.race.user.currentInstant -
            (firstPlayer.liveCheckpointsCrossed.length
              ? firstPlayer.liveCheckpointsCrossed[0].instant
              : Client.race.user.currentInstant);
        } else {
          // If there is at least one cp crossed (then the first player also crossed at least one)
          // The difference with the first according at the last cp crossed by this player
          let lastCpTimeDiff =
            c.liveCheckpointsCrossed[c.liveCheckpointsCrossed.length - 1]
              .instant -
            firstPlayer.liveCheckpointsCrossed[
              c.liveCheckpointsCrossed.length - 1
            ].instant;

          let nextCpTimeDiff = 0;
          if (
            c.liveCheckpointsCrossed.length <
            firstPlayer.liveCheckpointsCrossed.length
          ) {
            // If the first player crossed at least one cp more than this player
            nextCpTimeDiff =
              Client.race.user.currentInstant -
              firstPlayer.liveCheckpointsCrossed[
                c.liveCheckpointsCrossed.length
              ].instant; // Then this player is at least late of the time difference between the current time and the time at which this first player crossed this cp
          }
          timeDiff = Math.max(lastCpTimeDiff, nextCpTimeDiff); // Take the time diff which is higher to display it
        }
        timeDiff = "+" + Client.race.Functions.msToTime(timeDiff, 3, true); // Add a + for display purpose
      }

      // Add the data to the display table
      temp.push({
        ranking: i + 1,
        nickname: c.nickname,
        formattedRunTime: timeDiff,
        highlighted: c.isCurrentPlayer,
      });

      // Update the crossed checkpoints display
      if (c.isCurrentPlayer && c.liveCheckpointsCrossed.length > 0) {
        let checkpointIndice = c.liveCheckpointsCrossed.length - 1;
        let lastCp = c.liveCheckpointsCrossed[checkpointIndice];
        // This functions is called each time and the checkpoint time is only displayed if that's a new time
        Client.svelte.updateCheckpointTime(
          lastCp.instant,
          i + 1,
          Client.race.user.replay &&
            Client.race.user.replay.checkpointsCrossed.length >=
              c.liveCheckpointsCrossed.length
            ? lastCp.instant -
                Client.race.user.replay.checkpointsCrossed[checkpointIndice]
                  .instant
            : undefined
        );
      }
    }

    liveRankingValues = temp;
  };
</script>

<div class="raceRanking" out:fade={{ duration: 400 }}>
  <div class="raceRankingTitle">Live ranking</div>
  <div style="margin-top: 33px">
    <PointerzTable
      bind:values={liveRankingValues}
      columns={liveRankingTableColumns}
      highlightedStyle="background: var(--dark-grey-color);color: var(--white-color);" />
  </div>
</div>

<style>
  .raceRankingTitle {
    font-family: "virgo";
    font-size: 18px;
    text-align: center;
    margin-bottom: 8px;
    background: var(--dark-grey-color);
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding-top: 8px;
    padding-bottom: 8px;
    color: var(--white-color);
  }

  .raceRanking {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 280px;
    padding: 12px 12px;
    color: var(--almost-white-color);
    background: var(--container-blocks-bg);
    box-sizing: border-box;
    border-radius: 8px;
  }
</style>

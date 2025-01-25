<script>
  import EditorBlockbarComponent from "./EditorBlockbarComponent.svelte";
  import { editorMenuLastClick } from "../../misc/store";

  let blocksMenu = [
    {
      name: "STRUCTURE",
      subMenu: [{ name: "STRAIGHT" }, { name: "TURN" }],
    },
    {
      name: "RACE",
      subMenu: [
        { name: "CHECKPOINT" },
        { name: "START" },
        { name: "END" },
        { name: "MULTILAP" },
      ],
    },
    {
      name: "EFFECTS",
      subMenu: [{ name: "BOOST" }],
    },
    {
      name: "DRAW",
      subMenu: [{ name: "LINE" }, { name: "ARC" }],
    },
  ];

  Client.svelte.resetSelectedBlockType = function () {
    $editorMenuLastClick = { name: "" };
  };
</script>

<div class="blockbarContainer">
  <EditorBlockbarComponent {blocksMenu} />
</div>

<style>
  .blockbarContainer {
    width: 100%;
    position: absolute;
    bottom: 16px;
    left: 0;
  }
</style>

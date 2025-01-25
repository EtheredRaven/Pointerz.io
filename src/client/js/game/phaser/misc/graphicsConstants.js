module.exports = function (Client) {
  // GENERAL / CIRCUIT
  Client.phaser.BACKGROUND_COLOR = 0x000000;
  Client.phaser.ROAD_COLOR = 0x1c1c1c;
  Client.phaser.DRIFT_MARKS_COLOR = 0x000000;
  Client.phaser.FRONTIER_WIDTH = 8;
  Client.phaser.ROAD_SIDE_SURFACE = {
    WIDTH: 14,
    COLOR: 0x2466a8,
  };
  Client.phaser.ROAD_SOLID = {
    WIDTH: Client.race.Constants.roadDelimitationWidth,
    COLOR: 0xdbdbdb,
  };
  let i = 0;
  Client.phaser.LAYERS_DEPTHS = {
    BACKGROUND: i++,
    BLOCK_SURFACE: i++,
    BLOCK_SURFACE_SPRITE: i++,
    DRIFT_MARKS: i++,
    PLAYERS_THRUSTS: i++,
    BLOCK_SOLID: i++,
    PLAYERS: i++,
    PLAYERS_NICKNAMES: i++,
    EDITOR_BLOCK_BOUNDING_BOX: i++,
  };

  // RACE
  Client.phaser.race.BLOCKS_WITH_SPRITES = [
    Client.race.Constants.blockTypes.CHECKPOINT,
    Client.race.Constants.blockTypes.START,
    Client.race.Constants.blockTypes.END,
    Client.race.Constants.blockTypes.BOOST,
    Client.race.Constants.blockTypes.MULTILAP,
  ];
  Client.phaser.race.PLAYERS_FADEOUT_DURATION = 800;
  Client.phaser.race.NICKNAME_Y_POSITION = 25;

  // EDITOR
  Client.phaser.editor.TOOLS = {
    SELECT: 1,
    PLACE: 2,
    MOVE: 3,
    DRAW: 4,
    MODIFY: 5,
  };

  Client.phaser.editor.DEFAULT_ZOOM = 0.9;
  Client.phaser.editor.ZOOM_SPEED = 1 / 8;
  Client.phaser.editor.MAX_ZOOM = 3;
  Client.phaser.editor.MIN_ZOOM = 0.15;

  Client.phaser.editor.PLACED_BLOCK_ALPHA = 0.7;

  Client.phaser.editor.CANVAS_DRAGGING_SPEED = 1.3;
  Client.phaser.editor.DRAGGING_INERTIA = {
    VISCOUS_FRICTION: 0.92,
    SOLID_FRICTION: 0.01,
  };

  Client.phaser.editor.SELECTED_BLOCK_POSITION_INDICATOR_RADIUS = 8;
  Client.phaser.editor.SELECTED_BLOCK_BBOX_COLOR = 0xcfcf17;
  Client.phaser.editor.SELECTED_BLOCK_BBOX_WIDTH = 4;
  Client.phaser.editor.SELECTED_BLOCK_HANDLES = {
    MOVE: {
      SIZE: 16,
      WIDTH: 4,
    },
    RESIZE: {
      SIZE: 16,
    },
    ROTATE: {
      SIZE: 16,
    },
  };

  Client.phaser.editor.GEOMETRY_LINES = {
    WIDTH: 4,
    COLOR: 0xdbdbdb,
  };

  Client.phaser.interpolateColors = function (color1, color2, factor) {
    // Extract RGB components
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    // Interpolate each component
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    // Combine back to hex
    return (r << 16) | (g << 8) | b;
  };
};

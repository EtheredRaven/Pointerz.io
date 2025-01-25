const Functions = require("../../logic/Functions");

module.exports = function (Client) {
  // Draw the selected circuit block
  Client.phaser.drawBlock = function (block) {
    !block.surfaceDrawer && initBlockDrawers(block);
    Client.phaser.clearBlock(block);

    Client.phaser.race.BLOCKS_WITH_SPRITES.includes(block.blockType) &&
      drawSurfaceSprite(block);

    block.environment == Client.race.Constants.environments.ROAD &&
      drawRoad(block);

    block.blockType == Client.race.Constants.blockTypes.FRONTIER &&
      drawEnvironmentFrontier(block);

    let blockAlpha =
      block == Client.phaser.editor.placedBlock
        ? Client.phaser.editor.PLACED_BLOCK_ALPHA
        : 1;
    block.surfaceDrawer.setAlpha(blockAlpha);
    block.solidDrawer.setAlpha(blockAlpha);
    block.surfaceSprite && block.surfaceSprite.setAlpha(blockAlpha);

    if (
      block.environment == Client.race.Constants.environments.ROAD ||
      block.blockType == Client.race.Constants.blockTypes.SOLID
    ) {
      computeAndDrawBlockSide(block);
    }

    drawGeometryLines(block);
  };

  let initBlockDrawers = function (block) {
    block.surfaceDrawer = Client.phaser.scene.add.graphics();
    block.surfaceDrawer.setDepth(Client.phaser.LAYERS_DEPTHS.BLOCK_SURFACE);

    block.solidDrawer = Client.phaser.scene.add.graphics();
    block.solidDrawer.setDepth(Client.phaser.LAYERS_DEPTHS.BLOCK_SOLID);
  };

  let drawSurfaceSprite = function (block) {
    // If the block type is in this list, then its surface must be a sprite (grids, checkpoints etc...)
    block.surfaceSprite = Client.phaser.scene.add.tileSprite(
      block.components[0].x,
      block.components[0].y,
      block.components[0].width,
      block.components[0].height,
      block.blockType == Client.race.Constants.blockTypes.BOOST
        ? "boost"
        : "grid"
    );

    block.surfaceSprite.setDepth(
      Client.phaser.LAYERS_DEPTHS.BLOCK_SURFACE_SPRITE
    );
    block.surfaceSprite.setOrigin(0, 0);
    block.surfaceSprite.rotation = block.rotationAngle;
  };

  let drawRoad = function (block) {
    block.surfaceDrawer.lineStyle(0, 0);
    block.surfaceDrawer.fillStyle(Client.phaser.ROAD_COLOR);
    block.surfaceDrawer.fillPoints(block.points, true);
  };

  // A fading frontier between the road and space
  let drawEnvironmentFrontier = function (block) {
    let alpha = 1.8 / Client.phaser.FRONTIER_WIDTH;
    for (let i = 2 * Client.phaser.FRONTIER_WIDTH; i > 0; i = i - 2) {
      block.surfaceDrawer.lineStyle(i, 0x000000, alpha);
      block.surfaceDrawer.strokePoints(block.points, true);
    }
  };

  let computeAndDrawBlockSide = function (block) {
    // Points to draw in one line for angles
    let roadSidePointsBatch = [];
    let roadDelimitationPointsBatch = [];

    let firstComp = block.components[0];
    let lastComp = block.components[block.components.length - 1];

    // Find the direction in which to decalate the theoretical mid-width-points
    // Compute on which side of the delimitation is the solid frontier, to draw the line according to its width on the right position
    let pointForScalar1 = firstComp.points[0];
    let pointForScalar2 = lastComp.points[lastComp.points.length - 1];
    if (
      pointForScalar1.x == pointForScalar2.x &&
      pointForScalar1.y == pointForScalar2.y
    ) {
      pointForScalar2 = lastComp.points[0];
    }
    let sideSign = Math.sign(
      Client.race.Functions.scalarProduct(
        {
          x: pointForScalar1.x - pointForScalar2.x,
          y: pointForScalar1.y - pointForScalar2.y,
        },
        Client.race.Functions.getNormalVector({
          x1: firstComp.points[0].x,
          y1: firstComp.points[0].y,
          x2: firstComp.points[1].x,
          y2: firstComp.points[1].y,
        })
      )
    );

    for (let i = 0; i < 2 * block.components.length; i++) {
      // For each component of the block, the real points must be computed according to the width of the lines
      let previousComp = block.components[i % block.components.length];
      let nextComp = block.components[(i + 1) % block.components.length]; // Component to draw
      let nextNextComp = block.components[(i + 2) % block.components.length]; // Next one to be drawn

      // Compute the new points
      let nextCompPointsNumber = nextComp.closed
        ? nextComp.points.length + 1
        : nextComp.points.length;
      for (let j = 0; j < nextCompPointsNumber; j++) {
        let point = nextComp.points[j % nextComp.points.length];
        let normalVect;
        if (nextComp.shape == "Arc" && j == 0) {
          normalVect = Functions.normalizeVector({
            x:
              previousComp.points[previousComp.points.length - 1].x -
              nextComp.points[0].x,
            y:
              previousComp.points[previousComp.points.length - 1].y -
              nextComp.points[0].y,
          });
        } else if (nextComp.shape == "Arc" && j == nextCompPointsNumber - 1) {
          normalVect = Functions.normalizeVector({
            x:
              previousComp.points[0].x -
              nextComp.points[nextComp.points.length - 1].x,
            y:
              previousComp.points[0].y -
              nextComp.points[nextComp.points.length - 1].y,
          });
        } else {
          normalVect =
            nextComp.drawingLines[
              Math.max(0, (j - 1) % nextComp.drawingLines.length)
            ].getNormalVector();
        }

        let newRoadSidePoint = {
          x:
            point.x -
            ((Client.phaser.ROAD_SIDE_SURFACE.WIDTH +
              Client.phaser.ROAD_SOLID.WIDTH) /
              2) *
              normalVect.x *
              sideSign,
          y:
            point.y -
            ((Client.phaser.ROAD_SIDE_SURFACE.WIDTH +
              Client.phaser.ROAD_SOLID.WIDTH) /
              2) *
              normalVect.y *
              sideSign,
        };

        let lastRoadSidePoint =
          roadSidePointsBatch[roadSidePointsBatch.length - 1];
        if (
          !roadSidePointsBatch.length ||
          newRoadSidePoint.x != lastRoadSidePoint.x ||
          newRoadSidePoint.y != lastRoadSidePoint.y
        ) {
          // Don't duplicate points
          roadSidePointsBatch.push(newRoadSidePoint);
        }

        let newRoadDelimitationPoint = {
          x: point.x,
          y: point.y,
        };
        let lastRoadDelimitationPoint =
          roadDelimitationPointsBatch[roadDelimitationPointsBatch.length - 1];
        if (
          !roadDelimitationPointsBatch.length ||
          newRoadDelimitationPoint.x != lastRoadDelimitationPoint.x ||
          newRoadDelimitationPoint.y != lastRoadDelimitationPoint.y
        ) {
          // Don't duplicate points
          roadDelimitationPointsBatch.push(newRoadDelimitationPoint);
        }
      }

      // Draw these components
      if (
        i + 1 == 2 * block.components.length || // Last batch
        Math.round(nextComp.points[nextComp.points.length - 1].x) !=
          Math.round(nextNextComp.points[0].x) ||
        Math.round(nextComp.points[nextComp.points.length - 1].y) !=
          Math.round(nextNextComp.points[0].y) // Corresponding points for a path
      ) {
        if (block.environment == Client.race.Constants.environments.ROAD) {
          block.surfaceDrawer.lineStyle(
            Client.phaser.ROAD_SIDE_SURFACE.WIDTH,
            Client.phaser.ROAD_SIDE_SURFACE.COLOR
          );
          block.surfaceDrawer.strokePoints(roadSidePointsBatch);
          roadSidePointsBatch = [];
        }
        if (block.blockType == Client.race.Constants.blockTypes.SOLID) {
          block.solidDrawer.lineStyle(
            Client.phaser.ROAD_SOLID.WIDTH,
            Client.phaser.ROAD_SOLID.COLOR
          );
          block.solidDrawer.strokePoints(roadDelimitationPointsBatch);
          roadDelimitationPointsBatch = [];
        }
      }
    }
  };

  let drawGeometryLines = function (block) {
    if (
      Client.phaser.editor.placedBlock == block &&
      block.predefinedEditorBlockType ==
        Client.race.Constants.predefinedEditorBlockTypes.ARC
    ) {
      block.solidDrawer.lineStyle(
        Client.phaser.editor.GEOMETRY_LINES.WIDTH,
        Client.phaser.editor.GEOMETRY_LINES.COLOR
      );
      block.solidDrawer.lineBetween(
        block.x_center,
        block.y_center,
        block.first_point.x,
        block.first_point.y
      );
    }
  };

  Client.phaser.moveBlockDrawers = function (block, position) {
    block.surfaceDrawer.setX(Functions.snapGrid(position.x));
    block.surfaceDrawer.setY(Functions.snapGrid(position.y));
    block.solidDrawer.setX(Functions.snapGrid(position.x));
    block.solidDrawer.setY(Functions.snapGrid(position.y));
    if (block.surfaceSprite) {
      block.surfaceSprite.setX(Functions.snapGrid(position.x));
      block.surfaceSprite.setY(Functions.snapGrid(position.y));
    }
  };

  Client.phaser.clearBlock = function (block) {
    if (!block) return;
    block.surfaceDrawer.clear();
    block.solidDrawer.clear();
    block.surfaceSprite && block.surfaceSprite.destroy();
  };
};

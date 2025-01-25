const intersects = require("intersects");

module.exports = function (Client) {
  Client.phaser.editor.moveCanvasOnMouseMove = function () {
    // Dragging effect with the mouse to move on the canvas
    let pointer = Client.phaser.scene.input.activePointer;
    if (pointer.isDown) {
      if (Client.phaser.editor.continuousLastMousePosition) {
        Client.phaser.editor.scrollSpeedX =
          (Client.phaser.editor.CANVAS_DRAGGING_SPEED *
            (Client.phaser.editor.continuousLastMousePosition.x - pointer.x)) /
          Client.phaser.scene.cameras.main.zoom;
        Client.phaser.editor.scrollSpeedY =
          (Client.phaser.editor.CANVAS_DRAGGING_SPEED *
            (Client.phaser.editor.continuousLastMousePosition.y - pointer.y)) /
          Client.phaser.scene.cameras.main.zoom;

        // Store if the canvas has really been dragged
        (Client.phaser.editor.scrollSpeedX != 0 ||
          Client.phaser.editor.scrollSpeedY != 0) &&
          (Client.phaser.editor.isPerformingContinuousAction = true);
      }

      // Save the last mouse position to know how much we need to move the canvas on the next tick
      Client.phaser.editor.continuousLastMousePosition = {
        x: pointer.x,
        y: pointer.y,
      };
    }

    // Move the canvas
    Client.phaser.scene.cameras.main.setScroll(
      Client.phaser.scene.cameras.main.scrollX +
        Client.phaser.editor.scrollSpeedX,
      Client.phaser.scene.cameras.main.scrollY +
        Client.phaser.editor.scrollSpeedY
    );

    Client.phaser.editor.scrollSpeedX =
      Math.sign(Client.phaser.editor.scrollSpeedX) *
      Math.max(
        0,
        Math.abs(Client.phaser.editor.scrollSpeedX) *
          Client.phaser.editor.DRAGGING_INERTIA.VISCOUS_FRICTION -
          Client.phaser.editor.DRAGGING_INERTIA.SOLID_FRICTION
      );
    Client.phaser.editor.scrollSpeedY =
      Math.sign(Client.phaser.editor.scrollSpeedY) *
      Math.max(
        0,
        Math.abs(Client.phaser.editor.scrollSpeedY) *
          Client.phaser.editor.DRAGGING_INERTIA.VISCOUS_FRICTION -
          Client.phaser.editor.DRAGGING_INERTIA.SOLID_FRICTION
      );

    if (!pointer.isDown) {
      Client.phaser.editor.continuousLastMousePosition = undefined;
      Client.phaser.editor.isPerformingContinuousAction = false;
    }
  };

  Client.phaser.editor.zoomOnCanvas = function (pointer, dz) {
    // Zoom on the canvas, triggered with the middle mouse button
    let oldZoom = Client.phaser.scene.cameras.main.zoom;
    let newZoom = Math.min(
      Client.phaser.editor.MAX_ZOOM,
      Math.max(
        Client.phaser.editor.MIN_ZOOM,
        oldZoom * (1 - Math.sign(dz) * Client.phaser.editor.ZOOM_SPEED)
      )
    );

    // Zoom it !
    Client.phaser.scene.cameras.main.setZoom(newZoom);

    // Recenter on the mouse so that it seems we zoom on the zone the mouse is pointing at
    Client.phaser.scene.cameras.main.setScroll(
      Client.phaser.scene.cameras.main.scrollX +
        (pointer.worldX - Client.phaser.scene.cameras.main.midPoint.x) *
          (newZoom / oldZoom - 1),
      Client.phaser.scene.cameras.main.scrollY +
        (pointer.worldY - Client.phaser.scene.cameras.main.midPoint.y) *
          (newZoom / oldZoom - 1)
    );
  };

  // TODO : changer, non optimal de faire une boucle sur tous les blocs, faire un quadtree également
  Client.phaser.editor.selectClickedBlock = function (pointer) {
    let newSelectedBlock = false;
    let blocksClickedCounter = 0;
    for (let i = 0; i < Client.editor.editedCircuit.blocks.length; i++) {
      let block = Client.editor.editedCircuit.blocks[i];
      let points = [];
      block.points.forEach((point) => {
        points.push(point.x, point.y);
      });

      let isBlockClicked = intersects.pointPolygon(
        pointer.worldX,
        pointer.worldY,
        points,
        block.blockType == Client.race.Constants.blockTypes.SOLID
          ? Client.phaser.ROAD_SOLID.WIDTH / 2
          : 0
      );
      isBlockClicked && blocksClickedCounter++;

      if (
        isBlockClicked &&
        !Client.phaser.editor.previouslySelectedBlockList.includes(block)
      ) {
        Client.phaser.playSound("blockSelection");
        newSelectedBlock = block;
        Client.phaser.editor.previouslySelectedBlockList.push(block);
        break;
      }
    }

    if (blocksClickedCounter > 0 && !newSelectedBlock) {
      Client.phaser.editor.previouslySelectedBlockList = [];
    }

    Client.phaser.editor.selectBlock(
      newSelectedBlock ? newSelectedBlock : undefined
    );
  };

  Client.phaser.editor.selectClickedHandleFromSelectedBlock = function (
    pointer
  ) {
    let handles = Client.phaser.editor.selectedBlock.getHandles();
    for (let i = 0; i < handles.length; i++) {
      let handle = handles[i];
      let isHandleClicked = intersects.circlePoint(
        handle.position.x,
        handle.position.y,
        Client.phaser.editor.SELECTED_BLOCK_HANDLES.ROTATE.SIZE / 2,
        pointer.worldX,
        pointer.worldY
      );
      if (isHandleClicked) {
        Client.phaser.playSound("blockModification");
        Client.phaser.editor.selectedHandle = handle;
        return true;
      }
    }
    return false;
  };

  Client.phaser.editor.selectBlock = function (block) {
    Client.phaser.editor.selectedBlock = block;
    Client.phaser.editor.updateSelectedBlockGraphics();
  };

  Client.phaser.editor.setSelectedProperty = function (
    parent,
    propertyName,
    value
  ) {
    parent[propertyName] != value &&
      Client.phaser.editor.setCircuitSavedState(false);
    parent[propertyName] = value;
    Client.phaser.editor.updateSelectedBlockGraphics();
  };

  Client.phaser.editor.moveSelectedBlock = function (xDiff = 0, yDiff = 0) {
    if (!Client.phaser.editor.selectedBlock) return;
    (xDiff || yDiff) && Client.phaser.editor.setCircuitSavedState(false);
    Client.phaser.editor.selectedBlock.moveX(xDiff);
    Client.phaser.editor.selectedBlock.moveY(yDiff);
    Client.phaser.editor.updateSelectedBlockGraphics();
  };

  Client.phaser.editor.updateSelectedBlockGraphics = function () {
    if (Client.phaser.editor.selectedBlock) {
      Client.phaser.editor.selectedBlock.computeBlockCharacteristics();
      Client.phaser.drawBlock(Client.phaser.editor.selectedBlock);
    }
    Client.phaser.editor.drawSelectedBlockBoundingBox();
    Client.svelte.updateSelectedBlock();
  };

  Client.phaser.editor.updateDrawnBlockGraphics = function () {
    let pointer = Client.phaser.scene.input.activePointer;
    Client.phaser.editor.placedBlock.performDrawStep({
      x: pointer.worldX,
      y: pointer.worldY,
    });

    Client.phaser.editor.placedBlock.computeBlockCharacteristics();

    Client.phaser.drawBlock(Client.phaser.editor.placedBlock);
  };

  Client.phaser.editor.placeNewBlock = function (
    predefinedBlockTypeName,
    draw = false,
    blockData = false
  ) {
    Client.phaser.editor.currentTool = draw
      ? Client.phaser.editor.TOOLS.DRAW
      : Client.phaser.editor.TOOLS.PLACE;

    let blockTypeObject = Client.editor.editedCircuit.getBlockTypeObject(
      Client.race.Constants.predefinedEditorBlockTypes[predefinedBlockTypeName]
        .ID
    );

    // If it is a copy / paste
    if (blockData) {
      blockData = { ...blockData };
      blockData._id = undefined;
    }

    Client.phaser.editor.placedBlock = new blockTypeObject(
      blockData
        ? blockData
        : {
            setDefaultBlockParameters: true,
          }
    );

    Client.phaser.editor.placedBlock.x = 0;
    Client.phaser.editor.placedBlock.y = 0;
    Client.phaser.editor.placedBlock.computeBlockCharacteristics();

    Client.phaser.drawBlock(Client.phaser.editor.placedBlock);
  };

  Client.phaser.editor.addPlacedBlockInCircuit = function (draw = false) {
    if (!draw) {
      Client.phaser.editor.placedBlock.x =
        Client.phaser.editor.placedBlock.solidDrawer.x;
      Client.phaser.editor.placedBlock.y =
        Client.phaser.editor.placedBlock.solidDrawer.y;
      Client.phaser.moveBlockDrawers(Client.phaser.editor.placedBlock, {
        x: 0,
        y: 0,
      });
    }

    Client.phaser.editor.setCircuitSavedState(false);
    if (Client.phaser.editor.indexOfDrawnComponentToAddBlock != undefined) {
      let componentToAdd = Client.phaser.editor.placedBlock.components[0];
      let componentsList = Client.phaser.editor.selectedBlock.components;
      componentsList.splice(
        Client.phaser.editor.indexOfDrawnComponentToAddBlock,
        0,
        componentToAdd
      );
      Client.phaser.editor.indexOfDrawnComponentToAddBlock = undefined;
      Client.phaser.clearBlock(Client.phaser.editor.placedBlock);
    } else {
      Client.editor.editedCircuit.addBlock(
        Client.phaser.editor.placedBlock,
        true
      );
      Client.phaser.editor.selectBlock(Client.phaser.editor.placedBlock);
    }

    Client.phaser.playSound("blockPlacement");

    Client.phaser.editor.placedBlock = undefined;
    Client.phaser.editor.updateSelectedBlockGraphics();

    Client.phaser.editor.currentTool = Client.phaser.editor.TOOLS.SELECT;

    Client.svelte.resetSelectedBlockType();
  };

  Client.phaser.editor.deletePlacedBlock = function () {
    if (!Client.phaser.editor.placedBlock) {
      return;
    }
    Client.phaser.clearBlock(Client.phaser.editor.placedBlock);
    Client.phaser.editor.placedBlock = undefined;
    Client.phaser.editor.currentTool = Client.phaser.editor.TOOLS.SELECT;
  };

  Client.phaser.editor.goToNextDrawStep = function (pointer) {
    let isDrawingFinished = Client.phaser.editor.placedBlock.performDrawStep(
      {
        x: pointer.worldX,
        y: pointer.worldY,
      },
      true
    );

    if (isDrawingFinished) {
      Client.phaser.editor.addPlacedBlockInCircuit(true);
    }
  };

  Client.phaser.editor.convertSelectedBlockIntoCustomBlock = function () {
    Client.phaser.editor.selectedBlock.predefinedEditorBlockTypeId = undefined;
    Client.phaser.editor.selectedBlock.predefinedEditorBlockType = undefined;
    Client.phaser.editor.setCircuitSavedState(false);
    Client.svelte.updateSelectedBlock();
  };

  Client.phaser.editor.deleteComponent = function (
    component,
    updateGraphics = true
  ) {
    let componentIndex =
      Client.phaser.editor.selectedBlock.components.findIndex(
        (el) => component == el
      );
    Client.phaser.editor.selectedBlock.components.splice(componentIndex, 1);
    Client.phaser.editor.setCircuitSavedState(false);
    updateGraphics && Client.phaser.editor.updateSelectedBlockGraphics();
    return componentIndex;
  };

  Client.phaser.editor.moveComponent = function (component, down) {
    let componentsNumber = Client.phaser.editor.selectedBlock.components.length;
    let componentIndex = Client.phaser.editor.deleteComponent(component, false);
    Client.phaser.editor.setCircuitSavedState(false);
    if (down) {
      let newIndex = componentIndex + 1;
      newIndex >= componentsNumber - 1
        ? Client.phaser.editor.selectedBlock.components.push(component)
        : Client.phaser.editor.selectedBlock.components.splice(
            newIndex,
            0,
            component
          );
    } else {
      let newIndex = componentIndex - 1;
      Client.phaser.editor.selectedBlock.components.splice(
        newIndex,
        0,
        component
      );
    }
    Client.phaser.editor.updateSelectedBlockGraphics();
  };

  Client.phaser.editor.addComponent = function (selectedElement, selectedType) {
    Client.phaser.editor.indexOfDrawnComponentToAddBlock =
      Client.phaser.editor.selectedBlock.components.indexOf(selectedElement);
    Client.phaser.editor.placeNewBlock(selectedType.toUpperCase(), true);
  };

  Client.phaser.editor.deleteSelectedBlock = function () {
    if (!Client.phaser.editor.selectedBlock) {
      return;
    }
    Client.phaser.playSound("blockDeletion");
    Client.phaser.clearBlock(Client.phaser.editor.selectedBlock);
    Client.editor.editedCircuit.deleteBlock(Client.phaser.editor.selectedBlock);
    Client.phaser.editor.setCircuitSavedState(false);
    Client.phaser.editor.selectedBlock = undefined;
    Client.phaser.editor.selectedHandle = undefined;
    Client.phaser.editor.updateSelectedBlockGraphics();
  };

  Client.phaser.editor.copySelectedBlock = function () {
    Client.phaser.editor.copiedBlock = Client.phaser.editor.selectedBlock;
  };

  Client.phaser.editor.pasteCopiedBlock = function () {
    Client.phaser.editor.copiedBlock &&
      Client.phaser.editor.placeNewBlock(
        Client.phaser.editor.copiedBlock.predefinedEditorBlockType.TYPE,
        false,
        Client.phaser.editor.copiedBlock
      );
  };
};

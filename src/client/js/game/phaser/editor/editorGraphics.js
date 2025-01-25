module.exports = function (Client) {
  Client.phaser.editor.drawSelectedBlockBoundingBox = function () {
    Client.phaser.globalDrawers.editorBlockBoundingBox.clear();
    if (!Client.phaser.editor.selectedBlock) return;

    Client.phaser.globalDrawers.editorBlockBoundingBox.lineStyle(
      Client.phaser.editor.SELECTED_BLOCK_BBOX_WIDTH,
      Client.phaser.editor.SELECTED_BLOCK_BBOX_COLOR
    );

    Client.phaser.globalDrawers.editorBlockBoundingBox.strokePoints(
      Client.phaser.editor.selectedBlock.points,
      true
    );

    /*Client.phaser.globalDrawers.editorBlockBoundingBox.fillStyle(
      Client.phaser.editor.SELECTED_BLOCK_BBOX_COLOR,
      0.2
    );
    Client.phaser.globalDrawers.editorBlockBoundingBox.fillPoints(B
      Client.phaser.editor.selectedBlock.points,
      true
    );*/

    /*Client.phaser.globalDrawers.editorBlockBoundingBox.fillStyle(
      Client.phaser.editor.SELECTED_BLOCK_BBOX_COLOR
    );
    Client.phaser.globalDrawers.editorBlockBoundingBox.fillCircle(
      Client.phaser.editor.selectedBlock.rotationCenter.x,
      Client.phaser.editor.selectedBlock.rotationCenter.y,
      Client.phaser.editor.SELECTED_BLOCK_POSITION_INDICATOR_RADIUS
    );*/

    Client.phaser.globalDrawers.editorBlockBoundingBox.fillStyle(
      Client.phaser.editor.SELECTED_BLOCK_BBOX_COLOR
    );
    Client.phaser.globalDrawers.editorBlockBoundingBox.lineStyle(
      Client.phaser.editor.SELECTED_BLOCK_HANDLES.MOVE.WIDTH,
      Client.phaser.editor.SELECTED_BLOCK_BBOX_COLOR
    );
    let selectedBlockHandles = Client.phaser.editor.selectedBlock.getHandles();
    if (selectedBlockHandles) {
      selectedBlockHandles.forEach((handle) => {
        if (handle.type == "ROTATE") {
          Client.phaser.globalDrawers.editorBlockBoundingBox.fillCircle(
            handle.position.x,
            handle.position.y,
            Client.phaser.editor.SELECTED_BLOCK_HANDLES.ROTATE.SIZE / 2
          );
        } else if (handle.type == "RESIZE") {
          let squareSize =
            Client.phaser.editor.SELECTED_BLOCK_HANDLES.RESIZE.SIZE;
          Client.phaser.globalDrawers.editorBlockBoundingBox.fillRect(
            handle.position.x - squareSize / 2,
            handle.position.y - squareSize / 2,
            squareSize,
            squareSize
          );
        } else {
          let squareSize =
            Client.phaser.editor.SELECTED_BLOCK_HANDLES.MOVE.SIZE;
          Client.phaser.globalDrawers.editorBlockBoundingBox.lineBetween(
            handle.position.x - squareSize / 2,
            handle.position.y - squareSize / 2,
            handle.position.x + squareSize / 2,
            handle.position.y + squareSize / 2
          );
          Client.phaser.globalDrawers.editorBlockBoundingBox.lineBetween(
            handle.position.x + squareSize / 2,
            handle.position.y - squareSize / 2,
            handle.position.x - squareSize / 2,
            handle.position.y + squareSize / 2
          );
        }
      });
    }
  };
};

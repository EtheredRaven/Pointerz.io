const PredefinedBlock = require("./PredefinedBlock");
const Functions = require("../../Functions");

class RectangleShapedBlock extends PredefinedBlock {
  getHandles() {
    let handles = [
      this.getRotationHandle(),
      {
        type: "MOVE",
        position: this.getAveragePoint(),
        action: (cursorX, cursorY) => {
          let averagePoint = this.getAveragePoint();
          this.x = Functions.snapGrid(cursorX - (averagePoint.x - this.x));
          this.y = Functions.snapGrid(cursorY - (averagePoint.y - this.y));
        },
      },
    ];
    // Les lignes sont après rotation tandis que les composants sont avant
    for (let i = 0; i < this.lines.length; i += 2) {
      handles.push({
        type: "RESIZE",
        position: this.lines[i].getPointOnLine(0.5),
        action: (cursorX, cursorY) => {
          cursorX = Functions.snapGrid(cursorX);
          cursorY = Functions.snapGrid(cursorY);
          let line = this.lines[i];
          let cursor = { x: cursorX, y: cursorY };
          let middlePoint = line.getPointOnLine(0.5);
          let normalVector = line.getNormalVector();
          let middlePointToCursorVector = {
            x: cursor.x - middlePoint.x,
            y: cursor.y - middlePoint.y,
          };
          let scalarBetweenNormalAndCursor = Functions.scalarProduct(
            normalVector,
            middlePointToCursorVector
          );

          let getUnmovedPoint = () => {
            let unmovedComponent = this.lines[(i + 1) % this.lines.length];
            return {
              x: unmovedComponent.x2,
              y: unmovedComponent.y2,
            };
          };

          let unmovedPointBeforeMovement = getUnmovedPoint();
          if (i % 2) {
            this.width += scalarBetweenNormalAndCursor;
          } else {
            this.height += scalarBetweenNormalAndCursor;
          }

          this.computeBlockCharacteristics();
          let unmovedPointAfterMovement = getUnmovedPoint();
          this.x -= unmovedPointAfterMovement.x - unmovedPointBeforeMovement.x;
          this.y -= unmovedPointAfterMovement.y - unmovedPointBeforeMovement.y;
        },
      });
    }

    return handles;
  }

  get width() {
    return Math.round(this.components[0].width);
  }

  set width(newWidth) {
    newWidth = Math.round(newWidth);
    !isNaN(newWidth) && (this.components[0].width = newWidth);
  }

  get height() {
    return Math.round(this.components[0].height);
  }

  set height(newHeight) {
    newHeight = Math.round(newHeight);
    !isNaN(newHeight) && (this.components[0].height = newHeight);
  }
}

module.exports = RectangleShapedBlock;

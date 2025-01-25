const PredefinedBlock = require("./PredefinedBlock");
const Constants = require("../../Constants");
const Line = require("../components/Line");
const Functions = require("../../Functions");

class StraightBlock extends PredefinedBlock {
  setPredefinedBlockParameters(data) {
    data.predefinedEditorBlockType =
      Constants.predefinedEditorBlockTypes.STRAIGHT;
    data.predefinedEditorBlockTypeId = data.predefinedEditorBlockType.ID;
    data.components = [
      new Line({
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 0,
      }),
      new Line({
        x1: 1,
        y1: 1,
        x2: 0,
        y2: 1,
      }),
    ];

    super.setPredefinedBlockParameters(data);
  }

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

    let lineId = 0;
    for (let pointId = 0; pointId < this.points.length; pointId++) {
      let currentPoint = Functions.getRotatedPoint(
        this.points[pointId],
        this.rotationCenter,
        -this.rotationAngle
      );

      let isSolidLine = Functions.isSamePointPosition(
        {
          x: this.components[lineId].x1,
          y: this.components[lineId].y1,
        },
        currentPoint
      );
      // Create a virtual line if it's not a solid one
      let nextLine = isSolidLine
        ? this.components[(lineId + 1) % this.components.length]
        : this.components[lineId];
      let previousLine =
        this.components[lineId < 1 ? this.components.length - 1 : lineId - 1];
      let line = isSolidLine
        ? this.components[lineId]
        : new Line({
            x1: previousLine.x2,
            y1: previousLine.y2,
            x2: nextLine.x1,
            y2: nextLine.y1,
          });
      let unmovedComponent = nextLine;

      handles.push({
        type: "RESIZE",
        position: Functions.getRotatedPoint(
          line.getPointOnLine(0.5),
          this.rotationCenter,
          this.rotationAngle
        ),
        action: (cursorX, cursorY) => {
          cursorX = Functions.snapGrid(cursorX);
          cursorY = Functions.snapGrid(cursorY);
          let unrotatedCursor = Functions.getRotatedPoint(
            { x: cursorX, y: cursorY },
            this.rotationCenter,
            -this.rotationAngle,
            true
          );
          let middlePoint = line.getPointOnLine(0.5);
          let normalVector = line.getNormalVector();
          let middlePointToCursorVector = {
            x: unrotatedCursor.x - middlePoint.x,
            y: unrotatedCursor.y - middlePoint.y,
          };
          let scalarBetweenNormalAndCursor = Functions.scalarProduct(
            normalVector,
            middlePointToCursorVector
          );

          let getUnmovedPoint = () => {
            return Functions.getRotatedPoint(
              {
                x: unmovedComponent.x2,
                y: unmovedComponent.y2,
              },
              this.rotationCenter,
              this.rotationAngle,
              true
            );
          };
          let unmovedPointBeforeMovement = getUnmovedPoint();

          let movementVector = {
            x: scalarBetweenNormalAndCursor * normalVector.x,
            y: scalarBetweenNormalAndCursor * normalVector.y,
          };

          Functions.isSamePointPosition(
            line.getPointOnLine(0),
            previousLine.getPointOnLine(1)
          ) &&
            (previousLine.x2 += movementVector.x) &&
            (previousLine.y2 += movementVector.y);
          Functions.isSamePointPosition(
            line.getPointOnLine(1),
            nextLine.getPointOnLine(0)
          ) &&
            (nextLine.x1 += movementVector.x) &&
            (nextLine.y1 += movementVector.y);
          line.addVector(movementVector);

          this.computeBlockCharacteristics();
          let unmovedPointAfterMovement = getUnmovedPoint();

          this.x += unmovedPointBeforeMovement.x - unmovedPointAfterMovement.x;
          this.y += unmovedPointBeforeMovement.y - unmovedPointAfterMovement.y;
        },
      });

      isSolidLine && (lineId = (lineId + 1) % this.components.length);
    }

    return handles;
  }
}

module.exports = StraightBlock;

const Component = require("./Component");
const Functions = require("../../Functions");
const Constants = require("../../Constants");
const Line = require("./Line");

class Arc extends Component {
  constructor(data) {
    data.shape = "Arc";
    super(data);
    this.startingAngle = data.startingAngle;
    this.endingAngle = data.endingAngle;
    this.radius = data.radius;
    this.updatePointsNumber();
    this.x = data.x;
    this.y = data.y;
  }

  getHandles() {
    let middlePoint = this.getMiddlePoint();
    let lowerAngleAction = (cursorX, cursorY, reversed) => {
      let lowerAngle = reversed ? "endingAngle" : "startingAngle";
      let higherAngle = reversed ? "startingAngle" : "endingAngle";
      let lineBetweenClickAndCenter = new Line({
        x1: this.x,
        y1: this.y,
        x2: cursorX,
        y2: cursorY,
      });
      let newLowerAngle = lineBetweenClickAndCenter.getAngle(true);
      while (newLowerAngle >= this[higherAngle]) {
        newLowerAngle -= 2 * Math.PI;
      }
      let angleDiff = (this[higherAngle] - newLowerAngle) % (2 * Math.PI);
      this[lowerAngle] = Functions.snapAngle(this[higherAngle] - angleDiff);
    };

    let higherAngleAction = (cursorX, cursorY, reversed) => {
      let lowerAngle = reversed ? "endingAngle" : "startingAngle";
      let higherAngle = reversed ? "startingAngle" : "endingAngle";
      let lineBetweenClickAndCenter = new Line({
        x1: this.x,
        y1: this.y,
        x2: cursorX,
        y2: cursorY,
      });
      let newHigherAngle = lineBetweenClickAndCenter.getAngle(true);
      while (newHigherAngle < this[lowerAngle]) {
        newHigherAngle += 2 * Math.PI;
      }
      let angleDiff = (newHigherAngle - this[lowerAngle]) % (2 * Math.PI);
      this[higherAngle] = Functions.snapAngle(this[lowerAngle] + angleDiff);
    };

    return [
      {
        type: "MOVE",
        position: { x: this.x, y: this.y },
        action: (cursorX, cursorY) => {
          this.x = Functions.snapGrid(cursorX);
          this.y = Functions.snapGrid(cursorY);
        },
      },
      {
        type: "RESIZE",
        position: {
          x: middlePoint.x,
          y: middlePoint.y,
        },
        action: (cursorX, cursorY) => {
          let middlePointLine = {
            x: middlePoint.x - this.x,
            y: middlePoint.y - this.y,
          };
          let middlePointLineNorm = Functions.norm(
            middlePointLine.x,
            middlePointLine.y
          );
          middlePointLine.x = middlePointLine.x / middlePointLineNorm;
          middlePointLine.y = middlePointLine.y / middlePointLineNorm;
          let projectedCursorDistance = Math.max(
            0,
            Functions.scalarProduct(
              {
                x: cursorX - this.x,
                y: cursorY - this.y,
              },
              middlePointLine
            )
          );
          this.setRadius(Functions.snapGrid(projectedCursorDistance));
        },
      },
      {
        type: "ROTATE",
        position: { x: this.getFirstPoint().x, y: this.getFirstPoint().y },
        action: (cursorX, cursorY, reversed = false) => {
          reversed
            ? higherAngleAction(cursorX, cursorY, reversed)
            : lowerAngleAction(cursorX, cursorY, reversed);
          this.updatePointsNumber();
        },
      },
      {
        type: "ROTATE",
        position: { x: this.getLastPoint().x, y: this.getLastPoint().y },
        action: (cursorX, cursorY, reversed = false) => {
          reversed
            ? lowerAngleAction(cursorX, cursorY, reversed)
            : higherAngleAction(cursorX, cursorY, reversed);
          this.updatePointsNumber();
        },
      },
    ];
  }

  getFirstPoint() {
    return Functions.getRotatedPoint(
      { x: this.x + this.radius, y: this.y },
      this,
      this.startingAngle
    );
  }

  getMiddlePoint() {
    return Functions.getRotatedPoint(
      { x: this.x + this.radius, y: this.y },
      this,
      (this.startingAngle + this.endingAngle) / 2
    );
  }

  getLastPoint() {
    return Functions.getRotatedPoint(
      { x: this.x + this.radius, y: this.y },
      this,
      this.endingAngle
    );
  }

  updatePointsNumber() {
    this.pointsNumber =
      15 +
      Math.ceil(
        Math.abs(
          (this.endingAngle - this.startingAngle) *
            this.radius *
            Constants.pointsDensity
        )
      );
  }

  setStartingAngle(newStartingAngle) {
    if (!isNaN(newStartingAngle)) {
      this.startingAngle = newStartingAngle;
      this.updatePointsNumber();
    }
  }

  setEndingAngle(newEndingAngle) {
    if (!isNaN(newEndingAngle)) {
      this.endingAngle = newEndingAngle;
      this.updatePointsNumber();
    }
  }

  setRadius(newRadius) {
    if (!isNaN(newRadius)) {
      this.radius = newRadius;
      this.updatePointsNumber();
    }
  }
}

module.exports = Arc;

const PredefinedBlock = require("./PredefinedBlock");
const Constants = require("../../Constants");
const Functions = require("../../Functions");
const Line = require("../components/Line");

class ArcBlock extends PredefinedBlock {
  setPredefinedBlockParameters(data) {
    data.predefinedEditorBlockType = Constants.predefinedEditorBlockTypes.ARC;
    data.predefinedEditorBlockTypeId = data.predefinedEditorBlockType.ID;
    data.components = [
      {
        shape: "Arc",
        x: 0,
        y: 0,
        radius: 1,
        startingAngle: 0,
        endingAngle: 1,
        pointsNumber: 5,
      },
    ];

    super.setPredefinedBlockParameters(data);
  }

  performDrawStep({ x, y }, goToNextStep = false) {
    let lineBetweenClickAndCenter = new Line({
      x1: this.x_center,
      y1: this.y_center,
      x2: x,
      y2: y,
    });
    if (!this.currentDrawingStep) {
      this.currentDrawingStep = 0;
      this.x_center = Functions.snapGrid(x);
      this.y_center = Functions.snapGrid(y);
    } else if (this.currentDrawingStep == 1) {
      this.radius = Functions.snapGrid(
        Functions.distance(
          { x: this.x_center, y: this.y_center },
          { x: x, y: y }
        )
      );

      this.starting_angle = Functions.fromRadToDeg(
        Functions.snapAngle(lineBetweenClickAndCenter.getAngle(true))
      );
      this.ending_angle = this.starting_angle;
    } else if (this.currentDrawingStep == 2) {
      let newEndingAngle = Functions.fromRadToDeg(
        Functions.snapAngle(lineBetweenClickAndCenter.getAngle(true))
      );
      newEndingAngle < this.starting_angle && (newEndingAngle += 360);
      this.ending_angle = newEndingAngle;
    }

    if (goToNextStep) {
      this.currentDrawingStep++;
      return this.currentDrawingStep > 2;
    }
  }

  getHandles() {
    return this.components[0].getHandles();
  }

  get x_center() {
    return Math.round(this.components[0].x);
  }

  set x_center(newXCenter) {
    newXCenter = Math.round(newXCenter);
    !isNaN(newXCenter) && (this.components[0].x = newXCenter);
  }

  get y_center() {
    return Math.round(this.components[0].y);
  }

  set y_center(newYCenter) {
    newYCenter = Math.round(newYCenter);
    !isNaN(newYCenter) && (this.components[0].y = newYCenter);
  }

  get first_point() {
    return this.components[0].points[0];
  }

  get radius() {
    return Math.round(this.components[0].radius);
  }

  set radius(newRadius) {
    newRadius = Math.round(newRadius);
    !isNaN(newRadius) && this.components[0].setRadius(newRadius);
  }

  get starting_angle() {
    return Math.round(Functions.fromRadToDeg(this.components[0].startingAngle));
  }

  set starting_angle(newStartingAngle) {
    newStartingAngle = Math.round(newStartingAngle);
    !isNaN(newStartingAngle) &&
      this.components[0].setStartingAngle(
        Functions.fromDegToRad(newStartingAngle)
      );
  }

  get ending_angle() {
    return Math.round(Functions.fromRadToDeg(this.components[0].endingAngle));
  }

  set ending_angle(newEndingAngle) {
    newEndingAngle = Math.round(newEndingAngle);
    !isNaN(newEndingAngle) &&
      this.components[0].setEndingAngle(Functions.fromDegToRad(newEndingAngle));
  }

  get pointsNumber() {
    return this.components[0].pointsNumber;
  }

  set pointsNumber(newPointsNumber) {
    newPointsNumber = Math.round(newPointsNumber);
    !isNaN(newPointsNumber) &&
      (this.components[0].pointsNumber = newPointsNumber);
  }
}

module.exports = ArcBlock;

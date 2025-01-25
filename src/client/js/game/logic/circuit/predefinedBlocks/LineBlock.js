const PredefinedBlock = require("./PredefinedBlock");
const Constants = require("../../Constants");
const Line = require("../components/Line");
const Functions = require("../../Functions");

class LineBlock extends PredefinedBlock {
  setPredefinedBlockParameters(data) {
    data.predefinedEditorBlockType = Constants.predefinedEditorBlockTypes.LINE;
    data.predefinedEditorBlockTypeId = data.predefinedEditorBlockType.ID;
    data.components = [
      new Line({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
      }),
    ];

    super.setPredefinedBlockParameters(data);
  }

  performDrawStep({ x, y }, goToNextStep = false) {
    x = Functions.snapGrid(x);
    y = Functions.snapGrid(y);
    if (!this.currentDrawingStep) {
      this.currentDrawingStep = 0;
      this.x1 = x;
      this.y1 = y;
      this.x2 = x;
      this.y2 = y;
    } else if (this.currentDrawingStep == 1) {
      this.x2 = x;
      this.y2 = y;
    }

    if (goToNextStep) {
      this.currentDrawingStep++;
      return this.currentDrawingStep > 1;
    }
  }

  getHandles() {
    return this.components[0].getHandles();
  }

  get x1() {
    return Math.round(this.components[0].x1);
  }

  get y1() {
    return Math.round(this.components[0].y1);
  }

  get x2() {
    return Math.round(this.components[0].x2);
  }

  get y2() {
    return Math.round(this.components[0].y2);
  }

  set x1(newX1) {
    newX1 = Math.round(newX1);
    !isNaN(newX1) && (this.components[0].x1 = newX1);
  }

  set y1(newY1) {
    newY1 = Math.round(newY1);
    !isNaN(newY1) && (this.components[0].y1 = newY1);
  }

  set x2(newX2) {
    newX2 = Math.round(newX2);
    !isNaN(newX2) && (this.components[0].x2 = newX2);
  }

  set y2(newY2) {
    newY2 = Math.round(newY2);
    !isNaN(newY2) && (this.components[0].y2 = newY2);
  }
}

module.exports = LineBlock;

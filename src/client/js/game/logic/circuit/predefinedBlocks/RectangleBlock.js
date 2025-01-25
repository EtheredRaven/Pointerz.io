const RectangleShapedBlock = require("./RectangleShapedBlock");
const Constants = require("../../Constants");
const Functions = require("../../Functions");
const Rectangle = require("../components/Rectangle");

class RectangleBlock extends RectangleShapedBlock {
  setPredefinedBlockParameters(data) {
    data.predefinedEditorBlockType =
      Constants.predefinedEditorBlockTypes.RECTANGLE;
    data.predefinedEditorBlockTypeId = data.predefinedEditorBlockType.ID;
    data.components = [
      new Rectangle({
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      }),
    ];

    super.setPredefinedBlockParameters(data);
  }

  performDrawStep({ x, y }, goToNextStep = false) {
    x = Functions.snapGrid(x);
    y = Functions.snapGrid(y);
    if (!this.currentDrawingStep) {
      this.currentDrawingStep = 0;
      this.x = x;
      this.y = y;
    } else if (this.currentDrawingStep == 1) {
      if (x > this.x) {
        this.width = x - this.x;
      } else {
        this.width = this.x - x;
        this.x = x;
      }

      if (y > this.y) {
        this.height = y - this.y;
      } else {
        this.height = this.y - y;
        this.y = y;
      }
    }

    if (goToNextStep) {
      this.currentDrawingStep++;
      return this.currentDrawingStep > 1;
    }
  }

  get x() {
    return this.components[0].x;
  }

  get y() {
    return this.components[0].y;
  }

  get width() {
    return this.components[0].width;
  }

  get height() {
    return this.components[0].height;
  }

  set x(newX) {
    newX = Math.round(newX);
    !isNaN(newX) && (this.components[0].x = newX);
  }

  set y(newY) {
    newY = Math.round(newY);
    !isNaN(newX) && (this.components[0].y = newY);
  }

  set width(newWidth) {
    newWidth = Math.round(newWidth);
    !isNaN(newX) && (this.components[0].width = newWidth);
  }

  set height(newHeight) {
    newHeight = Math.round(newHeight);
    !isNaN(newX) && (this.components[0].height = newHeight);
  }
}

module.exports = RectangleBlock;

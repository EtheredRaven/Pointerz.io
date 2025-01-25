const RectangleShapedBlock = require("./RectangleShapedBlock");
const Constants = require("../../Constants");

class MultilapBlock extends RectangleShapedBlock {
  setPredefinedBlockParameters(data) {
    data.predefinedEditorBlockType =
      Constants.predefinedEditorBlockTypes.MULTILAP;
    data.predefinedEditorBlockTypeId = data.predefinedEditorBlockType.ID;
    data.components = [
      {
        shape: "Rectangle",
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      },
    ];

    super.setPredefinedBlockParameters(data);
  }

  get laps_number() {
    return this.lapsNumber;
  }

  set laps_number(newLapsNumber) {
    newLapsNumber = Math.round(newLapsNumber);
    !isNaN(newLapsNumber) && (this.lapsNumber = newLapsNumber);
  }
}

module.exports = MultilapBlock;

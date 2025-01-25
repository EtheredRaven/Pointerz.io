const RectangleShapedBlock = require("./RectangleShapedBlock");
const Constants = require("../../Constants");

class BoostBlock extends RectangleShapedBlock {
  setPredefinedBlockParameters(data) {
    data.predefinedEditorBlockType = Constants.predefinedEditorBlockTypes.BOOST;
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
}

module.exports = BoostBlock;

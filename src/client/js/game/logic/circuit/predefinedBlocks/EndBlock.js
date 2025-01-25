const RectangleShapedBlock = require("./RectangleShapedBlock");
const Constants = require("../../Constants");

class EndBlock extends RectangleShapedBlock {
  setPredefinedBlockParameters(data) {
    data.predefinedEditorBlockType = Constants.predefinedEditorBlockTypes.END;
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

module.exports = EndBlock;

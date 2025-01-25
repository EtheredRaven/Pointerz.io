const Block = require("../Block");

class PredefinedBlock extends Block {
  setPredefinedBlockParameters(data) {
    const defaultProperties = data.predefinedEditorBlockType.DEFAULT_PROPERTIES;
    this.computeBlockCharacteristics(data);

    for (let defaultProperty in defaultProperties) {
      let defaultPropertyValue = defaultProperties[defaultProperty];
      this[defaultProperty] = defaultPropertyValue;
      this.computeBlockCharacteristics();
    }
  }

  getHandles() {
    return [];
  }
}

module.exports = PredefinedBlock;

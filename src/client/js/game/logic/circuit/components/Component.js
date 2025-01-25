var ObjectID = require("bson").ObjectID;

class Component {
  constructor(data) {
    this._id = data._id ? data._id : new ObjectID();
    this.shape = data.shape;
    this.blockId = data.parent && data.parent._id;
    this.blockType = data.parent && data.parent.blockType;
    this.parentRotationAngle = data.parent && data.parent.rotationAngle;
  }
}

module.exports = Component;

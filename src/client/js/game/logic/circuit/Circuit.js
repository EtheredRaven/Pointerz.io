const Block = require("./Block");
const StraightBlock = require("./predefinedBlocks/StraightBlock");
const TurnBlock = require("./predefinedBlocks/TurnBlock");
const StartBlock = require("./predefinedBlocks/StartBlock");
const EndBlock = require("./predefinedBlocks/EndBlock");
const MultilapBlock = require("./predefinedBlocks/MultilapBlock");
const CheckpointBlock = require("./predefinedBlocks/CheckpointBlock");
const BoostBlock = require("./predefinedBlocks/BoostBlock");
const LineBlock = require("./predefinedBlocks/LineBlock");
const ArcBlock = require("./predefinedBlocks/ArcBlock");
const Quadtree = require("quadtree-lib");
const Constants = require("../Constants");
const RectangleBlock = require("./predefinedBlocks/RectangleBlock");
var ObjectID = require("bson").ObjectID;

class Circuit {
  constructor(data = {}) {
    this._id = data._id ? data._id : new ObjectID();
    this._creatorId = data._creatorId;
    this.width = data.width ? data.width : 3000;
    this.height = data.height ? data.height : 3000;
    this.lapsNumber = data.lapsNumber ? data.lapsNumber : 1;
    this.name = data.name;
    this.campaignPublicationTime = data.campaignPublicationTime;
    this.upvotes = data.upvotes;
    this.isEditedCircuit = data.isEditedCircuit;

    this.blocks = data.blocks ? data.blocks : []; // The blocks of the circuit
    this.images = data.images ? data.images : [];
    this.runs = data.runs ? data.runs : [];
    this.blocksNumber = {}; // Count the blocks of each type
    for (const blockType in Constants.blockTypes) {
      this.blocksNumber[Constants.blockTypes[blockType]] = 0;
    }

    this.linesQuad = new Quadtree({
      width: this.width,
      height: this.height,
    }); // The collision tree
    this.blocksQuad = new Quadtree({
      width: this.width,
      height: this.height,
    }); // The blocks tree (for environment changes)

    this.frontiers = []; // Precomputed frontiers between two environments
  }

  // Init the block objects
  initCircuit() {
    let temp = [...this.blocks];
    this.blocks = [];
    temp.forEach((block) => {
      this.addBlock(block);
    });
  }

  getBlockTypeObject(predefinedEditorBlockTypeId) {
    switch (predefinedEditorBlockTypeId) {
      case Constants.predefinedEditorBlockTypes.STRAIGHT.ID:
        return StraightBlock;
      case Constants.predefinedEditorBlockTypes.TURN.ID:
        return TurnBlock;
      case Constants.predefinedEditorBlockTypes.START.ID:
        return StartBlock;
      case Constants.predefinedEditorBlockTypes.END.ID:
        return EndBlock;
      case Constants.predefinedEditorBlockTypes.MULTILAP.ID:
        return MultilapBlock;
      case Constants.predefinedEditorBlockTypes.CHECKPOINT.ID:
        return CheckpointBlock;
      case Constants.predefinedEditorBlockTypes.BOOST.ID:
        return BoostBlock;
      case Constants.predefinedEditorBlockTypes.LINE.ID:
        return LineBlock;
      case Constants.predefinedEditorBlockTypes.ARC.ID:
        return ArcBlock;
      case Constants.predefinedEditorBlockTypes.RECTANGLE.ID:
        return RectangleBlock;
      default:
        return Block;
    }
  }

  // Add a new block object newly created
  addBlock(data, isAlreadyABlock = false) {
    let b = isAlreadyABlock
      ? data
      : new (this.getBlockTypeObject(data.predefinedEditorBlockTypeId))(data);
    this.blocksNumber[data.blockType] = this.blocksNumber[data.blockType]
      ? this.blocksNumber[data.blockType] + 1
      : 1; // Count the number of blocks per type (for checkpoints for example)

    this.blocks.push(b);
    if (
      b.blockType == Constants.blockTypes.START ||
      b.blockType == Constants.blockTypes.MULTILAP
    ) {
      this.setStart(b);
    }

    if (b.blockType == Constants.blockTypes.MULTILAP) {
      this.lapsNumber = b.lapsNumber;
    }

    this.linesQuad.pushAll(b.lines); // Add its lines to the collision tree

    if (data.environment != undefined) {
      let blockBoundindBox = {
        x: b.boundingBox.x,
        y: b.boundingBox.y,
        width: b.boundingBox.width,
        height: b.boundingBox.height,
        block: b,
      };
      this.blocksQuad.push(blockBoundindBox);
    }
  }

  // Initialize the start of the circuit
  setStart(data) {
    let line = data.components[0].lines[3];
    this.start = {
      x: (line.x2 + line.x1) / 2,
      y: (line.y2 + line.y1) / 2,
      angle: data.rotationAngle,
    };
  }

  getBlock(blockId) {
    return this.blocks.find(
      (block) => block._id.toString() == blockId.toString()
    );
  }

  deleteBlock(block) {
    block.lines.forEach((line) => {
      this.linesQuad.remove(line);
    });
    this.blocks.splice(this.blocks.indexOf(block), 1);
    this.blocksNumber[block.blockType]--;
  }

  getSchema(objectIdType) {
    return {
      locked: Boolean,
      width: Number,
      height: Number,
      name: String,
      creationDate: Number,
      campaignPublicationTime: Number,
      upvotes: Number,
      _creatorId: objectIdType,
      blocks: [
        {
          blockType: Number,
          environment: Number,
          predefinedEditorBlockTypeId: Number,
          rotationAngle: Number,
          lapsNumber: Number,
          components: [
            {
              shape: String,
              x: Number,
              y: Number,
              radius: Number,
              startingAngle: Number,
              endingAngle: Number,
              pointsNumber: Number,
              x1: Number,
              y1: Number,
              x2: Number,
              y2: Number,
              width: Number,
              height: Number,
              pointsList: [
                {
                  x: Number,
                  y: Number,
                },
              ],
            },
          ],
        },
      ],
      runs: [
        {
          _userId: objectIdType,
          _replayId: objectIdType,
          nickname: String,
          runTime: Number,
        },
      ],
    };
  }

  getFilteredDatabaseData() {
    let circuitSchema = this.getSchema(String);
    circuitSchema._id = String;

    let filterData = function (dataToFilter, schema) {
      let ret = {};
      for (let property in schema) {
        let schemaValue = schema[property];

        let dataValue = dataToFilter[property];
        if (dataValue == undefined) continue;

        if (Array.isArray(schemaValue)) {
          let filteredArray = [];
          let schemaObjectValue = schemaValue[0];
          dataValue.forEach((dataObjectValue) => {
            filteredArray.push(filterData(dataObjectValue, schemaObjectValue));
          });
          ret[property] = filteredArray;
        } else if (typeof schemaValue === "object") {
          let filteredObject = filterData(dataValue, schemaValue);
          ret[property] = filteredObject;
        } else {
          ret[property] = dataValue;
        }
      }

      return ret;
    };

    let filteredCircuit = filterData(this, circuitSchema);
    return filteredCircuit;
  }

  isRaceReady() {
    return (
      this.blocksNumber[Constants.blockTypes.START] +
        this.blocksNumber[Constants.blockTypes.MULTILAP] ==
        1 &&
      this.blocksNumber[Constants.blockTypes.END] +
        this.blocksNumber[Constants.blockTypes.MULTILAP] >
        0
    );
  }
}
module.exports = Circuit;

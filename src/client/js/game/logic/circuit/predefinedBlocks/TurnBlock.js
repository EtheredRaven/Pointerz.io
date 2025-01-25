const PredefinedBlock = require("./PredefinedBlock");
const Constants = require("../../Constants");
const Functions = require("../../Functions");

class TurnBlock extends PredefinedBlock {
  setPredefinedBlockParameters(data) {
    data.predefinedEditorBlockType = Constants.predefinedEditorBlockTypes.TURN;
    data.predefinedEditorBlockTypeId = data.predefinedEditorBlockType.ID;
    data.components = [
      {
        shape: "Arc",
        startingAngle: 0,
        endingAngle: 1,
        radius: 1,
        pointsNumber: 5,
        x: 0,
        y: 0,
      },
      {
        shape: "Arc",
        startingAngle: 1,
        endingAngle: 0,
        radius: 2,
        pointsNumber: 5,
        x: 0,
        y: 0,
      },
    ];

    super.setPredefinedBlockParameters(data);
  }

  getHandles() {
    let arc1 = this.getArcAtPosition(1);
    let arc2 = this.getArcAtPosition(2);
    let arc1Handles = arc1.getHandles();
    let arc2Handles = arc2.getHandles();

    let handles = [
      {
        type: "MOVE",
        position: { x: arc1.x, y: arc1.y },
        action: (cx, cy) => {
          this.x = Functions.snapGrid(cx - (arc1.x - this.x));
          this.y = Functions.snapGrid(cy - (arc1.y - this.y));
        },
      },
    ];

    let arc1EndingAngleHandle = arc1Handles[3];
    let arc2StartingHandle = arc2Handles[2];
    handles.push({
      type: "RESIZE",
      position: {
        x:
          (arc1EndingAngleHandle.position.x + arc2StartingHandle.position.x) /
          2,
        y:
          (arc1EndingAngleHandle.position.y + arc2StartingHandle.position.y) /
          2,
      },
      action: (cx, cy) => {
        arc1EndingAngleHandle.action(cx, cy);
        arc2StartingHandle.action(cx, cy, true);
      },
    });

    let arc1StartingHandle = arc1Handles[2];
    let arc2EndingAngleHandle = arc2Handles[3];
    handles.push({
      type: "RESIZE",
      position: {
        x:
          (arc1StartingHandle.position.x + arc2EndingAngleHandle.position.x) /
          2,
        y:
          (arc1StartingHandle.position.y + arc2EndingAngleHandle.position.y) /
          2,
      },
      action: (cx, cy) => {
        arc1StartingHandle.action(cx, cy);
        arc2EndingAngleHandle.action(cx, cy, true);
      },
    });

    handles.push(
      {
        type: "RESIZE",
        position: arc1.getMiddlePoint(),
        action: (cursorX, cursorY) => {
          let oldRadius = arc1.radius;
          arc1Handles[1].action(cursorX, cursorY);
          let radiusDiff = arc1.radius - oldRadius;
          arc2.setRadius(arc2.radius + radiusDiff);
        },
      },
      {
        type: "RESIZE",
        position: arc2.getMiddlePoint(),
        action: (cursorX, cursorY) => {
          arc2Handles[1].action(cursorX, cursorY);
        },
      }
    );
    return handles;
  }
}

module.exports = TurnBlock;

const Line = require("./components/Line");
const Rectangle = require("./components/Rectangle");
const Arc = require("./components/Arc");
const Polyline = require("./components/Polyline");
var ObjectID = require("bson").ObjectID;
var Functions = require("../Functions");
var Constants = require("../Constants");

class Block {
  constructor(data) {
    data.setDefaultBlockParameters
      ? this.setPredefinedBlockParameters(data)
      : this.computeBlockCharacteristics(data);
  }

  computeBlockCharacteristics(data = this) {
    this._id = data._id ? data._id : new ObjectID();
    this.blockType = data.blockType;
    this.environment = data.environment;
    this.lapsNumber = data.lapsNumber;
    this.predefinedEditorBlockTypeId = data.predefinedEditorBlockTypeId;
    this.predefinedEditorBlockType =
      Constants.reversedPredefinedEditorBlockTypes[
        this.predefinedEditorBlockTypeId
      ];
    this.rotationAngle = data.rotationAngle ? data.rotationAngle : 0;

    if (data != this) {
      this.components = [];
      data.components &&
        data.components.forEach((c) => {
          let componentType = Block.getComponentTypeObject(c.shape);
          this.components.push(new componentType(c));
        });
    }

    this.lines = [];
    this.points = [];
    this.drawingLines = [];

    // Compute non-rotated points and lines
    this.unrotatedPoints = [];
    for (let i = 0; i < this.components.length; i++) {
      let component = this.components[i];
      let ret = this["add" + component.shape](component);
      component.points = ret.points;
      this.unrotatedPoints.push(...component.points);
      component.lines = ret.lines;
      component.drawingLines = ret.drawingLines;
    }
    this.unrotatedBoundingBox = Functions.getBoundingBox(this.unrotatedPoints);

    this.initRotationCenter();

    for (let i = 0; i < this.components.length; i++) {
      let component = this.components[i];
      component.points = Functions.getRotatedPoints(
        component.points,
        this.rotationCenter,
        this.rotationAngle
      );
      component.lines.forEach((line) => {
        line.setRotation(this.rotationCenter, this.rotationAngle);
      });
      component.drawingLines.forEach((drawingLine) => {
        drawingLine.setRotation(this.rotationCenter, this.rotationAngle);
      });

      this.lines.push(...component.lines);
      for (let j = 0; j < component.points.length; j++) {
        let point = component.points[j];
        if (this.points.length) {
          let lastBlockPoint = this.points[this.points.length - 1];
          let firstBlockPoint = this.points[0];
          if (
            (point.x == lastBlockPoint.x && point.y == lastBlockPoint.y) ||
            (j == component.points.length - 1 &&
              point.x == firstBlockPoint.x &&
              point.y == firstBlockPoint.y &&
              component.shape != "Arc")
          ) {
            continue;
          }
        }
        this.points.push(point);
      }

      this.drawingLines.push(...component.drawingLines);
    }

    this.boundingBox = Functions.getBoundingBox(this.points);
  }

  initRotationCenter() {
    this.rotationCenter = this.components[0].points[0];
  }

  // Compute the lines for a set of points
  computeLines(points = [], closed = false) {
    let p1s = [];
    let p2s = [];
    for (let i = 0; i < points.length; i++) {
      let pointIndex = i % points.length;
      let point = points[pointIndex];
      let previousPoint = points[(i + points.length - 1) % points.length];
      let nextPoint = points[(i + 1) % points.length];

      let takeFirst = closed || pointIndex != 0;
      let takeLast = closed || pointIndex != points.length - 1;
      let t1 = new Line({
        parent: this,
        x1: previousPoint.x,
        y1: previousPoint.y,
        x2: point.x,
        y2: point.y,
      });
      let n1 = t1.getNormalVector();
      let t2 = new Line({
        parent: this,
        x1: point.x,
        y1: point.y,
        x2: nextPoint.x,
        y2: nextPoint.y,
      });
      let n2 = t2.getNormalVector();

      let widthFactor =
        takeFirst && takeLast
          ? Math.sqrt(2 / Math.max(0, 1 + Functions.linesCosinus(t1, t2)))
          : 1;

      let n = {
        x: (takeFirst ? n1.x : 0) + (takeLast ? n2.x : 0),
        y: (takeFirst ? n1.y : 0) + (takeLast ? n2.y : 0),
      };
      let norm = Functions.norm(n.x, n.y);
      n.x = (n.x / norm) * widthFactor;
      n.y = (n.y / norm) * widthFactor;

      p1s.push({
        x: point.x - (Constants.roadDelimitationWidth / 2) * n.x,
        y: point.y - (Constants.roadDelimitationWidth / 2) * n.y,
      });
      p2s.push({
        x: point.x + (Constants.roadDelimitationWidth / 2) * n.x,
        y: point.y + (Constants.roadDelimitationWidth / 2) * n.y,
      });
    }

    let lines = [];
    let drawingLines = [];
    for (let i = 0; i < (closed ? points.length : points.length - 1); i++) {
      let point = points[i];
      let nextPoint = points[(i + 1) % points.length];
      let midLine = new Line({
        parent: this,
        x1: point.x,
        y1: point.y,
        x2: nextPoint.x,
        y2: nextPoint.y,
      });

      if (this.blockType == Constants.blockTypes.SOLID) {
        lines.push(
          new Line({
            parent: this,
            x1: p1s[i].x,
            y1: p1s[i].y,
            x2: p1s[(i + 1) % points.length].x,
            y2: p1s[(i + 1) % points.length].y,
          })
        );
        lines.push(
          new Line({
            parent: this,
            x1: p2s[i].x,
            y1: p2s[i].y,
            x2: p2s[(i + 1) % points.length].x,
            y2: p2s[(i + 1) % points.length].y,
          })
        );
      } else {
        lines.push(midLine);
      }
      drawingLines.push(midLine);
    }

    return { lines: lines, drawingLines: drawingLines };
  }

  static getComponentTypeObject(componentShape) {
    switch (componentShape) {
      case "Arc":
        return Arc;
      case "Line":
        return Line;
      case "Rectangle":
        return Rectangle;
      case "Polyline":
        return Polyline;
    }
  }

  // The different components shapes
  addLine(c) {
    let points = [
      { x: c.x1, y: c.y1 },
      { x: c.x2, y: c.y2 },
    ];
    let { lines, drawingLines } = this.computeLines(points);
    return { points: points, lines: lines, drawingLines: drawingLines };
  }

  addPolyline(c) {
    let { lines, drawingLines } = this.computeLines(c.points);
    return { points: c.points, lines: lines, drawingLines: drawingLines };
  }

  addCircle(c) {
    c.startingAngle = 0;
    c.endingAngle = 2 * Math.PI;
    c.closed = true;
    return this.addArc(c);
  }

  addArc(c) {
    let points = [];

    let realPointsNumber = c.closed ? c.pointsNumber + 1 : c.pointsNumber;
    for (let i = 0; i < realPointsNumber; i++) {
      let theta =
        c.startingAngle +
        ((c.endingAngle - c.startingAngle) / (realPointsNumber - 1)) * i;
      points.push({
        x: c.x + Math.cos(theta) * c.radius,
        y: c.y + Math.sin(theta) * c.radius,
      });
    }
    let { lines, drawingLines } = this.computeLines(points, c.closed);
    return { points: points, lines: lines, drawingLines: drawingLines };
  }

  addRectangle(c) {
    c.closed = true;
    let points = [
      {
        x: c.x,
        y: c.y,
      },
      {
        x: c.x + c.width,
        y: c.y,
      },
      {
        x: c.x + c.width,
        y: c.y + c.height,
      },
      {
        x: c.x,
        y: c.y + c.height,
      },
    ];
    let { lines, drawingLines } = this.computeLines(points, c.closed);
    return { points: points, lines: lines, drawingLines: drawingLines };
  }

  isPredefinedBlockType(blockType) {
    return (
      this.predefinedEditorBlockType ==
      Constants.predefinedEditorBlockTypes[blockType]
    );
  }

  isPredefinedBlockProperty(blockProperty) {
    return (
      this.predefinedEditorBlockType.PROPERTIES.indexOf(blockProperty) > -1
    );
  }

  getAveragePoint(points = this.points) {
    let averagePoint = {
      x: 0,
      y: 0,
    };
    points.forEach((point) => {
      averagePoint.x += point.x;
      averagePoint.y += point.y;
    });
    averagePoint.x /= points.length;
    averagePoint.y /= points.length;

    return averagePoint;
  }

  getRotationHandle() {
    return {
      type: "ROTATE",
      position: this.rotationCenter,
      action: (cursorX, cursorY) => {
        let lineBetweenClickAndCenter = new Line({
          x1: this.rotationCenter.x,
          y1: this.rotationCenter.y,
          x2: cursorX,
          y2: cursorY,
        });
        let distanceToRotationCenter = Functions.lineNorm(
          lineBetweenClickAndCenter
        );
        if (distanceToRotationCenter > 8) {
          this.rotationAngle = Functions.snapAngle(
            lineBetweenClickAndCenter.getAngle(true) % (2 * Math.PI)
          );
        }
      },
    };
  }

  get x() {
    return Math.round(this.rotationCenter.x);
  }

  set x(newX) {
    newX = Math.round(newX);
    if (isNaN(newX)) return;
    let xDiff = newX - this.x;
    this.moveX(xDiff);
  }

  moveX(xDiff) {
    this.components.forEach((component) => {
      component.x != undefined && (component.x += xDiff);
      component.x1 != undefined && (component.x1 += xDiff);
      component.x2 != undefined && (component.x2 += xDiff);
    });
  }

  get y() {
    return Math.round(this.rotationCenter.y);
  }

  set y(newY) {
    newY = Math.round(newY);
    if (isNaN(newY)) return;
    let yDiff = newY - this.y;
    this.moveY(yDiff);
  }

  moveY(yDiff) {
    this.components.forEach((component) => {
      component.y != undefined && (component.y += yDiff);
      component.y1 != undefined && (component.y1 += yDiff);
      component.y2 != undefined && (component.y2 += yDiff);
    });
  }

  getDimension(width = true) {
    return width
      ? Math.round(this.unrotatedBoundingBox.width)
      : Math.round(this.unrotatedBoundingBox.height);
  }

  get length() {
    return this.getDimension(this.isPredefinedBlockType("STRAIGHT"));
  }

  setDimension(newLength, width = true) {
    newLength = Math.round(newLength);
    if (isNaN(newLength)) return;
    if (width) {
      for (let i = 0; i < this.components.length; i++) {
        let component = this.components[i];
        if (component.shape == "Rectangle") {
          component.width = newLength;
        } else if (component.shape == "Line") {
          let lengthDiff = newLength - this.unrotatedBoundingBox.width;
          component.x1 != this.unrotatedBoundingBox.x &&
            (component.x1 += lengthDiff);
          component.x2 != this.unrotatedBoundingBox.x &&
            (component.x2 += lengthDiff);
        }
      }
    } else {
      for (let i = 1; i <= this.components.length; i++) {
        let component =
          i < this.components.length ? this.components[i] : this.components[0];
        if (component.shape == "Rectangle") {
          component.height = newLength;
        } else if (component.shape == "Line") {
          let heightDiff = newLength - this.unrotatedBoundingBox.height;
          component.y1 != this.unrotatedBoundingBox.y &&
            (component.y1 += heightDiff);
          component.y2 != this.unrotatedBoundingBox.y &&
            (component.y2 += heightDiff);
        }
      }
    }
  }

  set length(newLength) {
    this.setDimension(newLength, this.isPredefinedBlockType("STRAIGHT"));
  }

  get width() {
    return this.getDimension(true);
  }

  set width(newWidth) {
    this.setDimension(newWidth, true);
  }

  get road_width() {
    if (this.isPredefinedBlockType("TURN")) {
      return Math.round(this.getArcAtPosition(2).radius) - this.interior_radius;
    } else if (this.isPredefinedBlockType("STRAIGHT")) {
      return this.getDimension(false);
    }
  }

  set road_width(newRoadWidth) {
    newRoadWidth = Math.round(newRoadWidth);
    if (isNaN(newRoadWidth)) return;
    if (this.isPredefinedBlockType("TURN")) {
      let isLeftSided = this.left_side;
      let isRightSided = this.right_side;
      this.getArcAtPosition(2).setRadius(this.interior_radius + newRoadWidth);
      this.updateSides(isLeftSided, isRightSided);
    } else if (this.isPredefinedBlockType("STRAIGHT")) {
      this.setDimension(newRoadWidth, false);
    }
  }

  get rotation() {
    return Math.round(Functions.fromRadToDeg(this.rotationAngle));
  }

  set rotation(newRotation) {
    newRotation = Math.round(newRotation);
    if (isNaN(newRotation)) return;
    newRotation = Functions.fromDegToRad(newRotation);
    this.rotationAngle = newRotation;
  }

  getIsSided(isRight) {
    let firstIndex = isRight ? 0 : this.components.length - 1;
    let secondthIndex = isRight ? 1 : 0;
    if (this.isPredefinedBlockType("STRAIGHT")) {
      let firstComponent = this.components[firstIndex];
      let supposedSideComponent = this.components[secondthIndex];
      return (
        firstComponent.x2 == supposedSideComponent.x1 &&
        firstComponent.y2 == supposedSideComponent.y1
      );
    } else if (this.isPredefinedBlockType("TURN")) {
      if (isRight) {
        return (
          this.components.length > 2 &&
          this.components[0].shape == "Arc" &&
          this.components[2].shape == "Arc"
        );
      } else {
        return this.components[this.components.length - 1].shape != "Arc";
      }
    }
  }

  get right_side() {
    return this.getIsSided(true);
  }

  get left_side() {
    return this.getIsSided(false);
  }

  setIsSided(isRight, newSideClosed) {
    let firstIndex = isRight ? 0 : this.components.length - 1;
    let secondthIndex = isRight ? 1 : 0;
    let isSided = isRight ? this.right_side : this.left_side;

    if (!isSided && newSideClosed) {
      let firstPoint, secondthPoint;
      if (this.isPredefinedBlockType("STRAIGHT")) {
        firstPoint = {
          x: this.components[firstIndex].x2,
          y: this.components[firstIndex].y2,
        };
        secondthPoint = {
          x: this.components[secondthIndex].x1,
          y: this.components[secondthIndex].y1,
        };
      } else if (this.isPredefinedBlockType("TURN")) {
        let firstArc = this.components[firstIndex];
        firstPoint = {
          x: firstArc.x + Math.cos(firstArc.endingAngle) * firstArc.radius,
          y: firstArc.y + Math.sin(firstArc.endingAngle) * firstArc.radius,
        };
        let lastArc = this.components[secondthIndex];
        secondthPoint = {
          x: lastArc.x + Math.cos(lastArc.startingAngle) * lastArc.radius,
          y: lastArc.y + Math.sin(lastArc.startingAngle) * lastArc.radius,
        };
      }

      let newLine = new Line({
        x1: firstPoint.x,
        y1: firstPoint.y,
        x2: secondthPoint.x,
        y2: secondthPoint.y,
      });

      isRight
        ? this.components.splice(secondthIndex, 0, newLine)
        : this.components.push(newLine);
    } else if (isSided && !newSideClosed) {
      isRight
        ? this.components.splice(secondthIndex, 1)
        : this.components.pop();
    }
  }

  set right_side(newRightSideClosed) {
    this.setIsSided(true, newRightSideClosed);
  }

  set left_side(newLeftSideClosed) {
    this.setIsSided(false, newLeftSideClosed);
  }

  updateSides(isLeftSided, isRightSided) {
    this.left_side = false;
    this.right_side = false;
    this.left_side = isLeftSided;
    this.right_side = isRightSided;
  }

  getArcAtPosition(index) {
    let numArcs = 0;
    for (let i = 0; i < this.components.length; i++) {
      let component = this.components[i];
      component.shape == "Arc" && numArcs++;
      if (numArcs == index) return component;
    }
  }

  get interior_radius() {
    return Math.round(this.getArcAtPosition(1).radius);
  }

  set interior_radius(newRadius) {
    let isLeftSided = this.left_side;
    let isRightSided = this.right_side;
    newRadius = Math.round(newRadius);
    if (isNaN(newRadius)) return;
    let previousPosition = {
      x: this.x,
      y: this.y,
    };

    let secondthArc = this.getArcAtPosition(2);
    secondthArc.setRadius(
      secondthArc.radius + newRadius - this.interior_radius
    );
    this.getArcAtPosition(1).setRadius(newRadius);
    this.updateSides(isLeftSided, isRightSided);

    this.computeBlockCharacteristics();

    this.x = previousPosition.x;
    this.y = previousPosition.y;
  }

  get starting_angle() {
    return Math.round(
      Functions.fromRadToDeg(this.getArcAtPosition(1).startingAngle)
    );
  }

  set starting_angle(newStartingAngle) {
    let isLeftSided = this.left_side;
    let isRightSided = this.right_side;
    let previousPosition = {
      x: this.x,
      y: this.y,
    };
    newStartingAngle = Math.round(newStartingAngle);
    if (isNaN(newStartingAngle)) return;
    newStartingAngle = Functions.fromDegToRad(newStartingAngle);

    let firstArc = this.getArcAtPosition(1);
    let secondthArc = this.getArcAtPosition(2);
    let angleRange = Functions.fromDegToRad(this.angle_range);
    firstArc.setStartingAngle(newStartingAngle);
    firstArc.setEndingAngle(newStartingAngle + angleRange);
    secondthArc.setStartingAngle(firstArc.endingAngle);
    secondthArc.setEndingAngle(firstArc.startingAngle);
    this.updateSides(isLeftSided, isRightSided);

    this.computeBlockCharacteristics();

    this.x = previousPosition.x;
    this.y = previousPosition.y;
  }

  get angle_range() {
    let firstArc = this.getArcAtPosition(1);
    return Math.round(
      Functions.fromRadToDeg(firstArc.endingAngle - firstArc.startingAngle)
    );
  }

  set angle_range(newAngleRange) {
    let isLeftSided = this.left_side;
    let isRightSided = this.right_side;
    newAngleRange = Math.round(newAngleRange);
    if (isNaN(newAngleRange)) return;
    newAngleRange = Math.min(
      2 * Math.PI,
      Functions.fromDegToRad(newAngleRange)
    );
    let firstArc = this.getArcAtPosition(1);
    let secondthArc = this.getArcAtPosition(2);

    firstArc.setEndingAngle(firstArc.startingAngle + newAngleRange);
    secondthArc.setStartingAngle(firstArc.endingAngle);

    this.updateSides(isLeftSided, isRightSided);
  }
}
module.exports = Block;

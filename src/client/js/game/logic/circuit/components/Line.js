const { ShapeInfo } = require("kld-intersections");
const Functions = require("../../Functions");
const Component = require("./Component");

class Line extends Component {
  constructor(data) {
    data.shape = "Line";
    super(data);
    this.rotation = data.rotation ? data.rotation : 0;

    this.x1 = data.x1;
    this.x2 = data.x2;
    this.y1 = data.y1;
    this.y2 = data.y2;

    this.computeLineCharacteristics();
  }

  computeLineCharacteristics() {
    // For collision tree
    this.x = Math.min(this.x1, this.x2);
    this.y = Math.min(this.y1, this.y2);
    this.width = Math.abs(this.x2 - this.x1);
    this.height = Math.abs(this.y2 - this.y1);

    this.points = [
      { x: this.x1, y: this.y1 },
      { x: this.x2, y: this.y2 },
    ];

    // Formatted object for intersection computations
    this.shapeInfo = ShapeInfo.line([this.x1, this.y1], [this.x2, this.y2]);
  }

  setRotation(origin, angle) {
    this.rotate(origin, angle - this.rotation);
    this.rotation = angle;
  }

  rotate(origin, angle) {
    let rotated1 = Functions.getRotatedPoint(
      { x: this.x1, y: this.y1 },
      origin,
      angle
    );
    let rotated2 = Functions.getRotatedPoint(
      { x: this.x2, y: this.y2 },
      origin,
      angle
    );

    this.x1 = rotated1.x;
    this.y1 = rotated1.y;
    this.x2 = rotated2.x;
    this.y2 = rotated2.y;

    this.computeLineCharacteristics();
  }

  // These vectors are not signed so its must be computed further ahead in the code
  getNormalVector() {
    let norm = Math.sqrt(
      Math.pow(this.y2 - this.y1, 2) + Math.pow(this.x2 - this.x1, 2)
    );
    let normal = {
      x: (this.y2 - this.y1) / norm,
      y: (this.x1 - this.x2) / norm,
    };
    return normal;
  }

  getTangentVector() {
    let norm = Math.sqrt(
      Math.pow(this.y2 - this.y1, 2) + Math.pow(this.x2 - this.x1, 2)
    );
    let tangent = {
      x: (this.x2 - this.x1) / norm,
      y: (this.y2 - this.y1) / norm,
    };
    return tangent;
  }

  // Get the positive angle between 0 and PI
  getAngle(directionAngle = false) {
    let piCoef = directionAngle ? 2 : 1;
    return (
      (Math.atan2(this.y2 - this.y1, this.x2 - this.x1) + piCoef * Math.PI) %
      (piCoef * Math.PI)
    );
  }

  getLength() {
    return Functions.norm(this.y2 - this.y1, this.x2 - this.x1);
  }

  getHandles() {
    // TODO : le mettre autre part dans phaser
    return [
      {
        type: "MOVE",
        position: { x: this.x1, y: this.y1 },
        action: (cursorX, cursorY) => {
          this.x1 = Functions.snapGrid(cursorX);
          this.y1 = Functions.snapGrid(cursorY);
        },
      },
      {
        type: "MOVE",
        position: { x: this.x2, y: this.y2 },
        action: (cursorX, cursorY) => {
          this.x2 = Functions.snapGrid(cursorX);
          this.y2 = Functions.snapGrid(cursorY);
        },
      },
      {
        type: "MOVE",
        position: { x: (this.x1 + this.x2) / 2, y: (this.y1 + this.y2) / 2 },
        action: (cursorX, cursorY) => {
          let oldCenter = {
            x: (this.x1 + this.x2) / 2,
            y: (this.y1 + this.y2) / 2,
          };
          let newCenter = {
            x: Functions.snapGrid(cursorX),
            y: Functions.snapGrid(cursorY),
          };
          let vector = {
            x: newCenter.x - oldCenter.x,
            y: newCenter.y - oldCenter.y,
          };
          this.x1 += vector.x;
          this.y1 += vector.y;
          this.x2 += vector.x;
          this.y2 += vector.y;
        },
      },
    ];
  }

  getPointOnLine(normalizedPosition) {
    // TODO : ajouter l'option de choisir si c'est le point sur la ligne dans le référentiel rotated ou non
    return {
      x: this.x1 + (this.x2 - this.x1) * normalizedPosition,
      y: this.y1 + (this.y2 - this.y1) * normalizedPosition,
    };
  }

  addVector(vector) {
    this.x1 += vector.x;
    this.y1 += vector.y;
    this.x2 += vector.x;
    this.y2 += vector.y;
  }

  get first_point_x() {
    return Math.round(this.x1);
  }

  get second_point_x() {
    return Math.round(this.x2);
  }

  get first_point_y() {
    return Math.round(this.y1);
  }

  get second_point_y() {
    return Math.round(this.y2);
  }

  set first_point_x(newX1) {
    newX1 = Math.round(newX1);
    !isNaN(newX1) && (this.x1 = newX1);
  }

  set second_point_x(newX2) {
    newX2 = Math.round(newX2);
    !isNaN(newX2) && (this.x2 = newX2);
  }

  set first_point_y(newY1) {
    newY1 = Math.round(newY1);
    !isNaN(newY1) && (this.y1 = newY1);
  }

  set second_point_y(newY2) {
    newY2 = Math.round(newY2);
    !isNaN(newY2) && (this.y2 = newY2);
  }
}

module.exports = Line;

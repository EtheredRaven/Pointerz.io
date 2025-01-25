const Functions = require("../Functions");

// The flame behind the player
class PlayerThrust {
  constructor(data) {
    Object.assign(this, data);

    // First collision box for force effects on the walls
    this.spritePoints = [
      { x: 0, y: 0 },
      { x: -24, y: -130 },
      { x: -450, y: 0 },
      { x: -24, y: 130 },
    ];
    let res = Functions.getBoundingBox(this.spritePoints);
    this.spriteWidth = res.width;
    this.spriteHeight = res.height;

    // Second collision box for fire effects
    this.preciseSpritePoints = [
      { x: 0, y: 0 },
      { x: -this.thrustPoint.x, y: -this.thrustPoint.y },
      { x: 0, y: 0 },
      { x: -29, y: -28 },
      { x: -95, y: -40 },
      { x: -250, y: 0 },
      { x: -95, y: 40 },
      { x: -29, y: 28 },
    ];
    res = Functions.getBoundingBox(this.preciseSpritePoints);
    this.preciseSpriteWidth = res.width;
    this.preciseSpriteHeight = res.height;
  }

  // Get the backbone line of the thrust for scalar products purposes
  getThrustLine() {
    let endPoint = Functions.getPoints(this, this.spritePoints, true)[2];
    let norm = Functions.norm(endPoint.x, endPoint.y);
    endPoint.x /= norm;
    endPoint.y /= norm;
    return endPoint;
  }

  // TODO : change for graphics collision box and forces collision box ?
  getThrustWidth() {
    return Math.abs(this.scale * this.spriteWidth);
  }

  getPreciseThrustWidth() {
    return Math.abs(this.scale * this.preciseSpriteWidth);
  }

  reset() {
    this.intersectionPoints = undefined;
    this.intersectedLine = undefined;
  }
}

module.exports = PlayerThrust;

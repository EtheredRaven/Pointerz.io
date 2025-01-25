const { ShapeInfo, Intersection } = require("kld-intersections");
const Constants = require("./Constants");

class Functions {
  // MISC
  static snapGrid(v, snap = window.isSnapping) {
    return snap ? Math.round(v / Constants.gridSize) * Constants.gridSize : v;
  }

  static snapAngle(a, snap = window.isSnapping) {
    return snap ? Math.round(a / Constants.angleSnap) * Constants.angleSnap : v;
  }

  static linearInterpolation(minX, maxX, minY, maxY, value) {
    return minY + ((value - minX) * (maxY - minY)) / (maxX - minX);
  }

  static capitalizeFirstLetter(s) {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Get a random integer between min and max included
  static getRandomInt(min, max) {
    return (
      Math.floor(min) + Math.floor(Math.random() * (Math.floor(max - min) + 1))
    );
  }

  // Format to human-readable format
  static msToTime(
    duration,
    decimals = 2,
    onlySeconds = false,
    showSign = false
  ) {
    let sign = "";
    if (duration < 0) {
      sign = "- ";
      duration = -duration;
    } else if (showSign) {
      sign = "+ ";
    }
    let milliseconds = parseInt((duration % 1000) / Math.pow(10, 3 - decimals)),
      seconds = onlySeconds
        ? Math.floor(duration / 1000)
        : Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    let zeros = Math.min(
      decimals - 1,
      Math.floor(decimals - Math.log10(milliseconds + 1))
    );
    let z = "";
    for (let i = 0; i < zeros; i++) {
      z += "0";
    }

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    milliseconds = z + milliseconds;

    if (onlySeconds) {
      return sign + seconds + "." + milliseconds;
    } else if (hours > 0) {
      return sign + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    } else {
      return sign + minutes + ":" + seconds + "." + milliseconds;
    }
  }

  // GEOMETRY

  // Get the normal vector of a line
  static normalizeVector(vector) {
    let norm = Functions.norm(vector.x, vector.y);
    let newVector = { x: vector.x / norm, y: vector.y / norm };
    return newVector;
  }

  static getNormalVector(line) {
    let norm = Math.sqrt(
      Math.pow(line.y2 - line.y1, 2) + Math.pow(line.x2 - line.x1, 2)
    );
    let normal = {
      x: (line.y2 - line.y1) / norm,
      y: (line.x1 - line.x2) / norm,
    };
    return normal;
  }

  // Get the real angle diff between two angles
  static getAngleDiff(a1, a2) {
    let possibleAngles = [
      a1 - 2 * Math.PI,
      a1 - Math.PI,
      a1,
      a1 + Math.PI,
      a1 + 2 * Math.PI,
    ];

    let realAngleDiff = Infinity;
    possibleAngles.forEach((possibleAngle) => {
      let angleDiff = a2 - possibleAngle;
      if (Math.abs(angleDiff) < realAngleDiff) {
        realAngleDiff = angleDiff;
      }
    });

    return realAngleDiff;
  }

  // Compute a distance based on the coordinates of both objects
  static distance(obj1, obj2) {
    return Functions.norm(obj1.x - obj2.x, obj1.y - obj2.y);
  }

  // Compute a norm for two coordinates
  static norm(x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  }

  static lineNorm(obj1) {
    return Functions.norm(obj1.x2 - obj1.x1, obj1.y2 - obj1.y1);
  }

  static linesCosinus(l1, l2) {
    return (
      Functions.scalarProduct(l1, l2) /
      (Functions.lineNorm(l1) * Functions.lineNorm(l2))
    );
  }

  // Compute the scalar products based on the coordinates of two objects
  static scalarProduct(obj1, obj2) {
    let x1 = obj1.x1 != undefined ? obj1.x2 - obj1.x1 : obj1.x;
    let y1 = obj1.y1 != undefined ? obj1.y2 - obj1.y1 : obj1.y;
    let x2 = obj2.x1 != undefined ? obj2.x2 - obj2.x1 : obj2.x;
    let y2 = obj2.y1 != undefined ? obj2.y2 - obj2.y1 : obj2.y;
    return x1 * x2 + y1 * y2;
  }

  // If a point is inside a polygon
  static isInside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

    var x = point.x,
      y = point.y;

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i].x,
        yi = vs[i].y;
      var xj = vs[j].x,
        yj = vs[j].y;

      var intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  static isSamePointPosition(p1, p2) {
    let roundIt = (c) => Math.round(c * 100) / 100;
    return roundIt(p1.x) == roundIt(p2.x) && roundIt(p1.y) == roundIt(p2.y);
  }

  // COLLISIONS

  // Get the real coordinates of a point based on the position and angle of a parent object
  static getPoint(parentObject, point, relative = false) {
    return {
      x:
        (relative ? 0 : parentObject.x) +
        parentObject.scale * point.x * Math.cos(parentObject.angle) -
        parentObject.scale * point.y * Math.sin(parentObject.angle),
      y:
        (relative ? 0 : parentObject.y) +
        parentObject.scale * point.x * Math.sin(parentObject.angle) +
        parentObject.scale * point.y * Math.cos(parentObject.angle),
    };
  }

  // Get several points
  static getPoints(parentObject, points, relative = false) {
    points = points ? points : parentObject.spritePoints;
    return points.map((p) => Functions.getPoint(parentObject, p, relative));
  }

  // Get the bounding / collision box in the shape of a rectangle (collision tree)
  static getBoundingBox(object) {
    let points = Array.isArray(object) ? object : Functions.getPoints(object);

    let res = points.reduce(
      (acc, p) => {
        return {
          minX: Math.min(acc.minX, p.x),
          maxX: Math.max(acc.maxX, p.x),
          minY: Math.min(acc.minY, p.y),
          maxY: Math.max(acc.maxY, p.y),
        };
      },
      { minX: Infinity, maxX: 0, minY: Infinity, maxY: 0 }
    );

    return {
      x: res.minX,
      y: res.minY,
      width: res.maxX - res.minX,
      height: res.maxY - res.minY,
    };
  }

  // Combined two bounding box in a bigger one
  static getCombinedBoundingBox(b1, b2) {
    return {
      x: Math.min(b1.x, b2.x),
      y: Math.min(b1.y, b2.y),
      width: Math.max(b1.x + b1.width, b2.x + b2.width) - Math.min(b1.x, b2.x),
      height:
        Math.max(b1.y + b1.height, b2.y + b2.height) - Math.min(b1.y, b2.y),
    };
  }

  // Return all the lines in the collision tree collided with a specific object
  static getCollidedObjects(collidingObjects, object, precise = false) {
    let collidingLines = collidingObjects.colliding(
      Functions.getBoundingBox(object), // get the gross collision box for searching in the collision tree and look for the collided lines (there are only lines in the collision quadtree)
      (primaryObj, collidedObj) => {
        // For each lines that is close enough to the gross bounding box
        let collidedLine = ShapeInfo.line(
          [collidedObj.x1, collidedObj.y1],
          [collidedObj.x2, collidedObj.y2]
        );
        // Compute the intersection between the shape and the line
        collidedObj.intersectionPoints = Intersection.intersect(
          ShapeInfo.polygon([...Functions.getPoints(object)]),
          collidedLine
        ).points; // Store the results in the line object for future processing (not possible for multi-threading hence)

        // If there is also another collision box (called precise collision box for the thrust for example : one for the forces and another for the thrust animation)
        collidedObj.preciseIntersectionPoints = [];
        if (precise && object.preciseSpritePoints) {
          collidedObj.preciseIntersectionPoints = Intersection.intersect(
            ShapeInfo.polygon([
              ...Functions.getPoints(object, object.preciseSpritePoints),
            ]),
            collidedLine
          ).points;
        }

        // If there is at least one intersection, then it's a match !
        return (
          collidedObj.intersectionPoints.length > 0 ||
          collidedObj.preciseIntersectionPoints.length > 0
        );
      }
    );

    return collidingLines;
  }

  static fromRadToDeg(radAngle) {
    return (radAngle * 360) / (2 * Math.PI);
  }

  static fromDegToRad(degAngle) {
    return (degAngle * 2 * Math.PI) / 360;
  }

  static getRotatedPoint(point, origin, angle, rounded = false) {
    let pointToOrigin = {
      x: point.x - origin.x,
      y: point.y - origin.y,
    };

    let returnedPoint = {
      x:
        origin.x +
        pointToOrigin.x * Math.cos(angle) -
        pointToOrigin.y * Math.sin(angle),
      y:
        origin.y +
        pointToOrigin.y * Math.cos(angle) +
        pointToOrigin.x * Math.sin(angle),
    };

    if (rounded) {
      returnedPoint.x = Math.round(returnedPoint.x);
      returnedPoint.y = Math.round(returnedPoint.y);
    }

    return returnedPoint;
  }

  static getRotatedPoints(pointsArray, origin, angle) {
    let ret = [];
    pointsArray.forEach((p) => {
      ret.push(Functions.getRotatedPoint(p, origin, angle));
    });
    return ret;
  }

  static roundToPrecision(n) {
    return Math.round(n * 1000000) / 1000000;
  }
}

module.exports = Functions;

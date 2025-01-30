let Constants = {};

// Blocks and environments
Constants.blockTypes = {
  SOLID: 1,
  CHECKPOINT: 2,
  START: 3,
  END: 4,
  BOOST: 5,
  FRONTIER: 6,
  MULTILAP: 7,
};

Constants.environments = {
  SPACE: 1,
  ROAD: 2,
};

Constants.pointsDensity = 1 / 20;
Constants.roadDelimitationWidth = 10;
let i = 1;
Constants.predefinedEditorBlockTypes = {
  START: {
    ID: i++,
    PROPERTIES: ["x", "y", "length", "rotation"],
    DEFAULT_PROPERTIES: {
      length: 200,
      width: 39,
      blockType: Constants.blockTypes.START,
    },
  },
  END: {
    ID: i++,
    PROPERTIES: ["x", "y", "length", "rotation"],
    DEFAULT_PROPERTIES: {
      length: 200,
      width: 39,
      blockType: Constants.blockTypes.END,
    },
  },
  MULTILAP: {
    ID: i++,
    PROPERTIES: ["x", "y", "length", "rotation", "laps_number"],
    DEFAULT_PROPERTIES: {
      length: 200,
      width: 39,
      blockType: Constants.blockTypes.MULTILAP,
      lapsNumber: 1,
    },
  },
  CHECKPOINT: {
    ID: i++,
    PROPERTIES: ["x", "y", "length", "rotation"],
    DEFAULT_PROPERTIES: {
      length: 200,
      width: 6,
      blockType: Constants.blockTypes.CHECKPOINT,
    },
  },
  BOOST: {
    ID: i++,
    PROPERTIES: ["x", "y", "length", "rotation"],
    DEFAULT_PROPERTIES: {
      length: 200,
      width: 25,
      blockType: Constants.blockTypes.BOOST,
    },
  },
  TURN: {
    ID: i++,
    PROPERTIES: [
      "x",
      "y",
      "interior_radius",
      "road_width",
      "starting_angle",
      "angle_range",
      "environment",
      "right_side",
      "left_side",
    ],
    DEFAULT_PROPERTIES: {
      environment: Constants.environments.ROAD,
      x: 0,
      y: 0,
      interior_radius: 400,
      road_width: 200,
      starting_angle: 0,
      angle_range: 45,
      blockType: Constants.blockTypes.SOLID,
      pointsNumber: (((1 / 20) * Math.PI) / 4) * 600,
    },
  },
  STRAIGHT: {
    ID: i++,
    PROPERTIES: [
      "x",
      "y",
      "length",
      "road_width",
      "rotation",
      "environment",
      "right_side",
      "left_side",
    ],
    DEFAULT_PROPERTIES: {
      length: 400,
      road_width: 200,
      environment: Constants.environments.ROAD,
      blockType: Constants.blockTypes.SOLID,
    },
  },
  LINE: {
    ID: i++,
    PROPERTIES: ["x1", "y1", "x2", "y2"],
    DEFAULT_PROPERTIES: {
      blockType: Constants.blockTypes.SOLID,
    },
  },
  ARC: {
    ID: i++,
    PROPERTIES: [
      "x_center",
      "y_center",
      "radius",
      "starting_angle",
      "ending_angle",
    ],
    DEFAULT_PROPERTIES: {
      blockType: Constants.blockTypes.SOLID,
      pointsNumber: 50,
    },
  },
  RECTANGLE: {
    ID: i++,
    PROPERTIES: ["width", "height", "x", "y"],
    DEFAULT_PROPERTIES: {
      blockType: Constants.blockTypes.SOLID,
    },
  },
};

Constants.reversedPredefinedEditorBlockTypes = {};
for (let predefinedEditorBlockType in Constants.predefinedEditorBlockTypes) {
  let predefinedData =
    Constants.predefinedEditorBlockTypes[predefinedEditorBlockType];
  predefinedData.TYPE = predefinedEditorBlockType;
  Constants.reversedPredefinedEditorBlockTypes[predefinedData.ID] =
    predefinedData;
}

Constants.componentTypes = {
  Arc: {
    id: i++,
    PROPERTIES: [
      "x",
      "y",
      "radius",
      "pointsNumber",
      "startingAngle",
      "endingAngle",
    ],
  },
  Line: {
    id: i++,
    PROPERTIES: [
      "first_point_x",
      "first_point_y",
      "second_point_x",
      "second_point_y",
    ],
  },
  Rectangle: {
    id: i++,
    PROPERTIES: ["x", "y", "width", "height"],
  },
};
Constants.reversedComponentTypes = {};
for (let componentType in Constants.componentTypes) {
  let componentData = Constants.componentTypes[componentType];
  componentData.TYPE = componentType;
  Constants.reversedComponentTypes[componentData.ID] = componentData;
}

// Game
Constants.gameWidth = 16384;
Constants.gameHeight = 16384;
Constants.updatingRate = 30; // Time between two steps

// Editor
Constants.gridSize = 10;
Constants.angleSnap = (2 * Math.PI * 5) / 360;

// Spaceship
Constants.spaceship = {};
Constants.spaceship.scale = 0.14;
Constants.spaceship.spritePoints = [
  { x: 156, y: 0 },
  { x: 0, y: -60 },
  { x: 0, y: 0 },
  { x: -15, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 60 },
];
Constants.spaceship.thrustAnchorPoint = {
  x: -134,
  y: 0,
};
Constants.spaceship.thrustScale = 0.18;
Constants.spaceship.wheelsAnchorPoints = [
  { x: 107, y: -40 },
  { x: 107, y: 40 },
  { x: -134, y: 0 },
];

Constants.defaultNFTs = {
  Body: {
    nftName: "Default Body",
    nftCategory: "Body",
    nftRarity: "4",
    isDefault: true,
  },
  Wheels: {
    nftName: "Default Wheels",
    nftCategory: "Wheels",
    nftRarity: "4",
    isDefault: true,
  },
  Flame: {
    nftName: "Default Flame",
    nftCategory: "Flame",
    nftRarity: "4",
    isDefault: true,
  },
};

Constants.nftRarities = {
  UNIQUE: "0",
  LEGENDARY: "1",
  EPIC: "2",
  RARE: "3",
  COMMON: "4",
};

Constants.nftRarityInfo = {
  0: {
    name: "Unique",
    color: "--red-color", // Red
  },
  1: {
    name: "Legendary",
    color: "--yellow-color", // Gold
  },
  2: {
    name: "Epic",
    color: "--purple-color", // Purple
  },
  3: {
    name: "Rare",
    color: "--blue-color", // Blue
  },
  4: {
    name: "Common",
    color: "--light-grey-color", // Grey
  },
};

// Physics
Constants.remainingSpeedAfterCollision = {
  tangential: 0.35, // Remaining tangential speed (wall angle) after collision
  normal: 0.5, // Remaining normal speed after collision
  minNormal: 80, // Minimum normal speed after collision
  minTangential: 80,
};
Constants.speedPenaltyDuration = 10; // Duration of the speed penalty after a collision

Constants.environmentPhysics = {};
Constants.environmentPhysics[Constants.environments.ROAD] = {
  angleSpeedMax: (6 * Math.PI) / 8,
  halfAngleSpeedTime: 0.2,
  timeToStopFromHalfAngleSpeed: 0.1,
  vmax: 600,
  halfVmaxTime: 3,
  timeToStopFromHalfSpeed: 3,
};
Constants.environmentPhysics[Constants.environments.SPACE] = {
  angleSpeedMax: (9 * Math.PI) / 8,
  halfAngleSpeedTime: 0.2,
  timeToStopFromHalfAngleSpeed: 0.2,
  vmax: 1000,
  halfVmaxTime: 5,
  timeToStopFromHalfSpeed: 5,
};

Constants.brakingRelativeForce = 0.8;

Constants.minRoadTurningRadius = 20;
Constants.maxRoadTurningRadius = 400;
Constants.roadTurningRadiusInterpolationFactor = 1.5;
Constants.inversedRoadTurningRadiusIncrement =
  1 / Constants.maxRoadTurningRadius;

Constants.driftAdditionalRotatingForce = 0.8;
Constants.driftReductedBrakingForce = 0.4;
Constants.driftAdherenceFactor = 1.14; // The higher, the more the spaceship sticks to the road and to the direction of the front wheels
Constants.driftAdherenceTransitionTime = 200; // Time to reach the drift adherence factor or to go back to the normal adherence factor
Constants.driftAdherenceTransitionIncrement =
  (Constants.driftAdherenceFactor - 1) /
  (Constants.driftAdherenceTransitionTime / Constants.updatingRate);
Constants.driftStartingAngle = Math.PI / 18;

Constants.thrustDriftProximityFactorPower = 2;
Constants.thrustDriftRelativeForce = 2.3;
Constants.thrustDriftAdditionRotationRelativeForce = 0.7;

Constants.boostDuration = 10;
Constants.boostRelativeForce = 2;

module.exports = Constants;

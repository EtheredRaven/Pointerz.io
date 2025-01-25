module.exports = function (Client) {
  // Sprite creation
  Client.phaser.createSprite = function (data, scene = Client.phaser.scene) {
    let sprite = scene.add.image(
      data.x ? data.x : 0,
      data.y ? data.y : 0,
      data.name ? data.name : "none"
    );

    sprite.setOrigin(
      data.originX != undefined ? data.originX : 0.5,
      data.originY != undefined ? data.originY : 0.5
    );

    sprite.setScale(
      data.scaleX ? data.scaleX : data.scale ? data.scale : 1,
      data.scaleY ? data.scaleY : data.scale ? data.scale : 1
    );

    data.depth && sprite.setDepth(data.depth);

    sprite.rotation = data.rotation ? data.rotation : 0;
    if (data.tint != undefined) {
      sprite.tint = data.tint;
    }
    sprite.alpha = 1;

    return sprite;
  };

  // Sprite progressive size reduction
  Client.phaser.reduceSprite = function (sprite, coef) {
    if (!sprite) return;

    var interval = setInterval(() => {
      if (!sprite || sprite.width < 10) {
        sprite && sprite.destroy();
        clearInterval(interval);
        return;
      }
      sprite.width = sprite.width * coef;
      sprite.height = sprite.height * coef;
    }, 20);
  };

  // Sprite fade out effect
  Client.phaser.fadeOut = function (sprite, fadeOutDuration, cb) {
    if (!sprite) return;
    if (!fadeOutDuration) {
      sprite.alpha = 0;
      cb();
      return;
    }
    let stepSize = 20;
    let coef = stepSize / fadeOutDuration;
    let interval = setInterval(() => {
      if (!sprite || sprite.alpha <= 0) {
        sprite && cb();
        clearInterval(interval);
        return;
      }
      sprite.alpha = Math.max(sprite.alpha - coef, 0);
    }, stepSize);
  };

  // Turn the sprite to the angle of the object
  Client.phaser.updateSpriteRotation = function (obj, speed) {
    if (!obj.sprite) {
      return;
    }

    let possibleDiffs = [
      obj.angle - obj.sprite.rotation,
      obj.angle + 2 * Math.PI - obj.sprite.rotation,
      obj.angle - 2 * Math.PI - obj.sprite.rotation,
    ];
    let realDiff = Infinity;
    possibleDiffs.forEach((possibleDiff) => {
      if (Math.abs(realDiff) > Math.abs(possibleDiff)) {
        realDiff = possibleDiff;
      }
    });
    obj.sprite.rotation =
      (obj.sprite.rotation + realDiff * speed + 2 * Math.PI) % (2 * Math.PI);
  };
};

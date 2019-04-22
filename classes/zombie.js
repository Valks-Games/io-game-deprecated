var PerlinGenerator = require("proc-noise");
var Perlin = new PerlinGenerator(); // seeds itself if no seed is given as an argument

module.exports = class Zombie {
  constructor(a) {
    this.x = a.x;
    this.y = a.y;
    this.size = a.size;
    this.angle = a.angle;
    this.health = a.health;
    this.speed = a.health;
    this.spotRange = a.spotRange;
    this.target = a.target;
    this.roamX = 1;
    this.roamY = 10;
  }

  findTarget(players) {
    let nearestDistance = Infinity;
    let nearestTarget = null;

    for (const player of players) {
      let dx = Math.abs(this.x - player.x);
      let dy = Math.abs(this.y - player.y);
      let distance = Math.hypot(dx, dy);

      if (distance < this.spotRange && distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = player;
      } else {
        this.target = null;
      }
    }

    if (!nearestTarget) return;

    this.target = nearestTarget;
  }

  moveTowardsTarget() {
    if (!this.target) {

      // Zombies randomly roam the map when they can't spot any of the players
      this.roamX += 0.05;
      this.roamY += 0.05;
      this.x += (Perlin.noise(this.roamX) * 6) - 3;
      this.y += (Perlin.noise(this.roamY) * 6) - 3;

    } else {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;

      const angle = Math.atan2(dy, dx);

      const xVelocity = 0.5 * Math.cos(angle) * 3;
      const yVelocity = 0.5 * Math.sin(angle) * 3;

      this.x += xVelocity;
      this.y += yVelocity;
    }

    return true;
  }
};
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
    if (!this.target) return false;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;

    const angle = Math.atan2(dy, dx);

    const xVelocity = 0.5 * Math.cos(angle);
    const yVelocity = 0.5 * Math.sin(angle);

    this.x += xVelocity;
    this.y += yVelocity;

    return true;
  }
};

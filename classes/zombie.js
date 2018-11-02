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
			const dx = Math.abs(this.x - player.x);
			const dy = Math.abs(this.y - player.y);
			const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

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
		if (!this.target) return;

		let dx = this.target.x - this.x;
		let dy = this.target.y - this.y;

		let angle = Math.atan2(dy, dx);

		let xVelocity = 0.5 * Math.cos(angle);
		let yVelocity = 0.5 * Math.sin(angle);

		this.x += xVelocity;
		this.y += yVelocity;
	}
}
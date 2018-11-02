/*
 * Every entity object has a x and y value.
 */
class Entity {
	constructor(a) {
		this.x = a.x;
		this.y = a.y;
		this.angle = a.angle;
		this.size = a.size;
	}

	draw() {

	}

	angleTowardsMouse() {
		let dx = winMouseX - width / 2;
		let dy = winMouseY - height / 2;
		let angle = Math.atan2(dy, dx);

		return angle;
	}
}

class LivingEntity extends Entity {
	constructor(a) {
		super(a);

		this.health = a.health;
		this.color = a.color;
	}

	draw() {
		if (this.color) fill(this.color.r, this.color.g, this.color.b);
		ellipse(this.x, this.y, this.size, this.size);
	}
}

class Player extends LivingEntity {
	constructor(a) {
		super(a);

		this.client = a.client;
		this.name = a.name;
		this.storedAngle = a.angle;
		if (a.weapon) this.weapon = new weapon(a.x, a.y, a.size);
	}

	draw() {
		this.drawRotatingElements();
		this.drawNonRotatingElements();
	}

	drawMessage(message) {
		push();
		fill(0, 200);
		let padding = 2;
		noStroke();
		rect(this.x - textWidth(message) / 2 - padding, this.y - this.size / 1.5 - textAscent() * 2 + padding, textWidth(message) + padding * 2, textAscent(), 20);
		fill(255);
		text(message, this.x - textWidth(message) / 2, this.y - this.size / 1.5 - textAscent());
		stroke(0);
		pop();
	}

	handlePlayerFunctions() {
		if (this.client) {
			this.angle = this.angleTowardsMouse();
		}

		if (this.angle != this.storedAngle) sendData = true;
		this.storedAngle = this.angle;

		this.handleMovement(); // Player can move
		this.pickup(); // Player can pick up stuff
		this.drop(); // Player can drop stuff
	}

	drawRotatingElements() {
		push();
		translate(this.x, this.y);
		rotate(this.angle + PI + PI / 2);
		translate(-this.x, -this.y);

		if (this.weapon) this.weapon.draw();
		this.drawHands();
		super.draw();
		this.drawEyes();
		pop();
	}

	drawNonRotatingElements() {
		text(this.name, this.x - textWidth(this.name) / 2, this.y - this.size / 2 - textDescent());
	}

	drawEyes() {
		fill(100, 100, 200);
		ellipse(this.x + this.size / 6, this.y + this.size / 3, this.size / 10, this.size / 10);
		ellipse(this.x - this.size / 6, this.y + this.size / 3, this.size / 10, this.size / 10);
	}

	drawHands() {
		fill(0);
		ellipse(this.x + this.size / 3, this.y + this.size / 3, this.size / 5, this.size / 5);
		ellipse(this.x - this.size / 3, this.y + this.size / 3, this.size / 5, this.size / 5);
	}

	handleMovement() {
		if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
			this.x -= 1;
			if (this.weapon) this.weapon.x -= 1;
			sendData = true;
		}
		if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
			this.x += 1;
			if (this.weapon) this.weapon.x += 1;
			sendData = true;
		}
		if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
			this.y += 1;
			if (this.weapon) this.weapon.y += 1;
			sendData = true;
		}
		if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
			this.y -= 1;
			if (this.weapon) this.weapon.y -= 1;
			sendData = true;
		}
	}

	drop() {
		if (!keyIsDown(82)) return; // Check for user 'r' input
		if (!this.weapon) return; // No weapon equipped
		weapons.push(this.weapon); // Place weapon back in world
		this.weapon = null;
	}

	pickup() {
		if (!keyIsDown(69)) return; // Check for user 'e' input
		if (this.weapon) return; // Player already has a weapon equpped

		// Find the nearest weapon from the player
		let nearestDistance = this.size * 1.5;
		let nearestWeapon = null;

		for (const weapon of weapons) {
			const distance = dist(weapon.x, weapon.y, this.x, this.y)

			if (distance < this.size * 1.5 && distance < nearestDistance) {
				nearestDistance = distance;
				nearestWeapon = weapon;
			}
		}

		if (!nearestWeapon) return; // No weapon was found

		this.weapon = nearestWeapon; // Update the players weapon
		this.weapon.x = this.x; // Re-update the weapon x
		this.weapon.y = this.y; // Re-update the weapon y

		weapons.splice(weapons.indexOf(nearestWeapon), 1); // Remove the weapon from the world
	}
}

class Zombie extends LivingEntity {
	constructor(a) {
		super(a);

		this.target = null;
	}

	draw() {
		super.draw();
		this.drawEyes();

		this.findTarget();
		this.moveTowardsTarget();
	}

	drawEyes() {
		fill(0, 255, 0);
		ellipse(this.x, this.y, this.size / 10, this.size / 10);
		ellipse(this.x, this.y, this.size / 10, this.size / 10);
	}

	findTarget() {
		let nearestDistance = Infinity;
		let nearestTarget = null;

		for (const entity of entities) {
			const distance = dist(entity.x, entity.y, this.x, this.y);

			if (entity != this && !(entity instanceof Zombie) && distance < nearestDistance) {
				nearestDistance = distance;
				nearestTarget = entity;
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

class Mage extends Player {
	constructor(a) {
		super(a);

		this.mana = 100;
	}
}

class Archer extends Player {
	constructor(a) {
		super(a);
	}
}

class Swordsman extends Player {
	constructor(a) {
		super(a);
	}
}

class Tank extends Swordsman {
	constructor(a) {
		super(a);
	}
}

class Weapon extends Entity {
	constructor(a) {
		super(a);
	}

	draw() {

	}
}

class Bow extends Weapon {
	constructor(a) {
		super(a);
	}

	draw() {
		push();
		noFill();
		strokeWeight(this.size / 20);
		stroke(139, 69, 19);
		arc(this.x, this.y + this.size / 10, this.size, this.size, 0, PI);
		stroke(50);
		line(this.x, this.y + this.size / 2 - this.size / 20, this.x, this.y + this.size / 2 + this.size / 4);
		pop();
	}
}

class Sword extends Weapon {
	constructor(a) {
		super(a);
	}

	draw() {
		push();
		fill(139, 69, 19);
		stroke(0);
		let swordWidth = this.size / 10;

		rect(this.x - swordWidth / 2, this.y + this.size / 2 - this.size / 10, swordWidth, this.size / 2);
		pop();
	}
}

class Wand extends Weapon {
	constructor(a) {
		super(a);
	}

	draw() {
		push();
		fill(139, 69, 19);
		let wandWidth = this.size / 10;

		rect(this.x - wandWidth / 2, this.y + this.size / 2 - this.size / 10, wandWidth, this.size / 2);

		fill(255, 0, 0);
		ellipse(this.x, this.y + this.size - this.size / 10, this.size / 8, this.size / 8);
		pop();
	}
}

class Projectile extends Entity {
	constructor(a) {
		super(a);
	}

	draw() {

	}
}

class Arrow extends Projectile {
	constructor(a) {
		super(a);
	}

	draw() {
		fill(0);
		ellipse(this.x, this.y, this.size, this.size);
	}

	move() {
		this.x += 1;
		this.y += 1;
	}
}
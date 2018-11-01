/*
 * Every entity object has a x and y value.
 */
class Entity {
	constructor(x, y, angle, size) {
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.size = size;
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
	constructor(x, y, angle, size, health) {
		super(x, y, angle, size);
		
		this.health = health;
	}
	
	draw() {
		fill(0);
		ellipse(this.x, this.y, this.size, this.size);
	}
}

class Player extends LivingEntity {
	constructor(x, y, angle, size, name, health, weapon, client) {
		super(x, y, angle, size, health);
		
		this.id = id;
		this.client = client;
		this.name = name;
		this.storedAngle = angle;
		if (weapon) this.weapon = new weapon(x, y, size);
	}
	
	draw() {
		this.drawRotatingElements();
		this.drawNonRotatingElements();
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
		text(this.name, this.x, this.y);
	}
	
	drawEyes() {
		fill(255);
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
	constructor(x, y, angle, size, health) {
		super(x, y, angle, size, health);
		
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
		ellipse(this.x, this.y, this.size/10, this.size/10);
		ellipse(this.x, this.y, this.size/10, this.size/10);
	}
	
	findTarget() {
		let nearestDistance = Infinity;
		let nearestTarget = null;
		
		for (const entity of entities) {
			const distance = dist(entity.x, entity.y, this.x, this.y);
			
			if (entity != this && !(entity instanceof Zombie) && distance < nearestDistance){
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
	constructor(x, y, size, name, weapon, health) {
		super(x, y, size, name, weapon, health);
		
		this.mana = 100;
	}
}

class Archer extends Player {
	constructor(x, y, size, name, weapon, health) {
		super(x, y, size, name, weapon, health);
	}
}

class Swordsman extends Player {
	constructor(x, y, size, name, weapon, health) {
		super(x, y, size, name, weapon, health);
	}
}

class Tank extends Swordsman {
	constructor(x, y, size, name, weapon, health) {
		super(x, y, size, name, weapon, health);
	}
}

class Weapon extends Entity {
	constructor(x, y, size) {
		super(x, y, size);
	}
	
	draw() {
		
	}
}

class Bow extends Weapon {
	constructor(x, y, size) {
		super(x, y, size);
	}
	
	draw() {
		push();
		noFill();
		strokeWeight(this.size/20);
		stroke(139, 69, 19);
		arc(this.x, this.y + this.size / 10, this.size, this.size, 0, PI);
		stroke(50);
		line(this.x, this.y + this.size / 2 - this.size / 20, this.x, this.y + this.size / 2 + this.size / 4);
		pop();
	}
}

class Sword extends Weapon {
	constructor(x, y, size) {
		super(x, y, size);
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
	constructor(x, y, size) {
		super(x, y, size);
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
	constructor(x, y, size) {
		super(x, y, size);
	}
	
	draw() {
		
	}
}

class Arrow extends Projectile {
	constructor(x, y, size) {
		super(x, y, size);
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
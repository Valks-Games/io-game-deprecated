module.exports = class Player { // Created to simplify things..
	constructor(id, x, y, size, name, health, angle) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.size = size;
		this.name = name;
		this.health = health;
		this.angle = angle;
	}
}
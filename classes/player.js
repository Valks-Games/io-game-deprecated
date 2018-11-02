module.exports = class Player { // Created to simplify things..
	constructor(a) {
		this.id = a.id;
		this.x = a.x;
		this.y = a.y;
		this.size = a.size;
		this.name = a.name;
		this.health = a.health;
		this.angle = a.angle;
		this.color = a.color;
	}
}
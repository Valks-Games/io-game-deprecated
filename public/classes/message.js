class Message {
	constructor(a) {
		this.x = a.x;
		this.y = a.y;
		this.text = a.text;
		this.playerSize = a.playerSize;
	}

	draw() {
		push();
		fill(0, 200);
		let padding = 2;
		noStroke();
		rect(this.x - textWidth(this.text) / 2 - padding, this.y - this.playerSize - textAscent() * 2 + padding, textWidth(this.text) + padding * 2, textAscent(), 20);
		fill(255);
		text(this.text, this.x - textWidth(this.text) / 2, this.y - this.playerSize - textAscent());
		stroke(0);
		pop();
	}
}
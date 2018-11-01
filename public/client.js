// Socket
var socket;

// Font
var myFont;

// Entities & Weapons
let entities = [];
let weapons = [];

// Other clients
let players = [];
let messages = [];

// Client
let client;
let id;

let playing = true;

// Zoom
let zoom = 0;
let cutSceneSlider = 0;
let cutSceneLength = 100;
let currentZoom = 0;

// Data Handler
let sendData;

function preload() {
	myFont = loadFont('./fonts/SourceSansPro-Black.otf');
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	textFont(myFont);
	noStroke();
	noSmooth();

	createClient();
	client = findClient();

	socket = io.connect("http://142.161.99.156:4000/", { // Make connection
		reconnect: true
	});

	socket.emit('new_player', { // We join a server, we must now tell the server we are here..
		x: client.x,
		y: client.y,
		size: client.size,
		name: client.name,
		health: client.health
	});

	listener();
}

function createClient() {
	entities.push(new Player({
		x: 100,
		y: 100,
		angle: 0,
		size: 20,
		name: "Someone",
		health: 20,
		client: true
	})); // client
}

function findClient() { // We have to do it this way because of how zombies search for entities and this client (player) is a entity too.
	client = null;
	for (const entity of entities) {
		if (!(entity instanceof Player)) continue;
		if (!entity.client) continue;
		return entity;
	}
}

function draw() {
	handleZoom();
	background(200);

	if (client) camera(client.x, client.y, cutSceneLength + height - currentZoom - cutSceneSlider, client.x, client.y, 0, 0, 1, 0);

	drawServerMessages();
	drawClientMessages();

	drawEntities();
	drawWeapons();
	drawPlayers();

	drawTree(); // 3D Reference
}

function drawEntities() {
	for (entity of entities) {
		entity.draw();
		if (entity instanceof Player) entity.handlePlayerFunctions();
	};
}

function drawWeapons() {
	for (weapon of weapons) weapon.draw();
}

function drawPlayers() {
	for (player of players) { // Other clients
		if (player.id == id) continue; // Do not draw this client, only draw other clients
		new Player({
			x: player.x,
			y: player.y,
			angle: player.angle,
			size: player.size,
			name: player.name,
			health: player.health,
			client: false
		}).draw();
	}
}

function drawClientMessages() {
	for (let message of messages) {
		if (message.id != id) continue;
		new Message({
			x: client.x,
			y: client.y,
			text: message.text,
			playerSize: client.size
		}).draw();
	}
}

function drawServerMessages() {
	for (let message of messages) {
		for (let player of players) {
			if (player.id != message.id) continue;
			if (player.id == id) continue;
			new Message({
				x: player.x,
				y: player.y,
				text: message.text,
				playerSize: player.size
			}).draw();
		}
	}
}

function keyPressed() {
	if (!playing) return;
	if (isChatVisible() === "block") {
		if (keyCode == ENTER) {
			socket.emit('text', {
				text: getChatText(),
				id: id
			});

			resetChat();
		}
	}

	if (keyCode == ENTER) {
		toggleChat();
	}
}

function drawTree() {
	push();
	stroke(0);
	fill(94, 77, 47);
	sphere(50);
	pop();
}

function handleZoom() {
	cutSceneSlider = lerp(cutSceneSlider, cutSceneLength, 0.03);
	currentZoom = lerp(currentZoom, zoom, 0.02);
}

function mouseWheel(event) {
	const ZOOM_OUT = 0; // The smaller the value the 'higher' you can see..
	const ZOOM_IN = 500; // The larger the value the 'closer' you can see..

	if (zoom <= ZOOM_IN && zoom >= ZOOM_OUT) zoom -= event.delta;
	zoom = Math.min(ZOOM_IN, zoom);
	zoom = Math.max(ZOOM_OUT, zoom);
}

setInterval(function() { // This is the client sending data to the server every 33 milliseconds. (Emit ourself (this client) to the server.)
	if (sendData) {
		sendData = false;
		if (client) { // Only emit if the client exists.
			socket.emit('player_update', {
				x: client.x,
				y: client.y,
				size: client.size,
				name: client.name,
				health: client.health,
				angle: client.angle
			});
		}
	}
}, 33);

function listener() {
	socket.on('handshake', function(data) {
		id = data;
	});

	socket.on('client_ids', function(data) { // The server tells all other clients that we are here..
		players = data;
	});

	socket.on('messages', function(data) {
		messages = data;
	});
}
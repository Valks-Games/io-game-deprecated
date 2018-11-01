// Socket
var socket;

// Font
var myFont;

// Entities & Weapons
let entities = [];
let weapons = [];

// Other clients
let players = [];

// Client
let client;
let id;

// Zoom
let zoom;
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
	socket = io.connect("http://142.161.99.156:4000/", { // Make connection
      reconnect: true	
    });
	
	// Entities
	entities.push(new Player(100, 100, 0, 20, "Someone", 20, null, true)); // client
	//entities.push(new LivingEntity(200, 200, 20, 20));
	//entities.push(new Zombie(120, 120, 20, 20));
	
	// Weapons
	//weapons.push(new Bow(100, 100, 20));
	//weapons.push(new Sword(150, 150, 20));
	
	// Find the client
	// We have to do it this way because of how zombies search for entities and this client (player) is a entity too.
	client = null;
	for (const entity of entities) {
		if (!(entity instanceof Player)) continue;
		if (!entity.client) continue;
		client = entity;
	}
	
	socket.emit('new_player', { // We join a server, we must now tell the server we are here..
      x: client.x,
      y: client.y,
      size: client.size,
      name: client.name,
      health: client.health
    });
	
	createCanvas(windowWidth, windowHeight, WEBGL);
	textFont(myFont);
	noStroke();
	noSmooth();
	zoom = 0;
	
	listener();
}

function draw() {
	handleZoom();
	background(200);
	if (client) camera(client.x, client.y, cutSceneLength + height - currentZoom - cutSceneSlider, client.x, client.y, 0, 0, 1, 0);
	
	for (entity of entities) {
		entity.draw();
		entity.handlePlayerFunctions();
	};
	for (weapon of weapons)	weapon.draw();
	
	for (player of players) { // Other clients
		if (player.id == id) continue; // Do not draw this client, only draw other clients
		new Player(player.x, player.y, player.angle, player.size, player.name, player.health, null, false).draw();
	}
	
	drawTree(); // Because why not..
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
}
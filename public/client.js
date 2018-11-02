// Socket
let socket;

// Font
let myFont;

// Entities & Weapons
const entities = [];
const weapons = [];

// Other clients
let players = [];
let zombies = [];
let messages = [];

// Client
let client;
let id;

let playing = false;
let creatingPlayer = false;
let dead = false;
let playerName = 'unnamed';

// Zoom
let zoom = 0;
let cutSceneSlider = 0;
const cutSceneLength = 100;
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
}

function draw() {
  handleZoom();
  background(200);

  playerSetup();

  if (playing) {
    if (client) camera(client.x, client.y, cutSceneLength + height - currentZoom - cutSceneSlider, client.x, client.y, 0, 0, 1, 0);

    drawServerMessages();
    drawClientMessages();

    drawEntities();
    drawWeapons();
    drawPlayers();
    drawZombies();

    drawTree(); // 3D Reference
  }

  if (dead) {
    dead = false;
    playing = false;
    toggleMenu();
    socket.disconnect();
  }
}

function playerSetup() {
  if (creatingPlayer) {
    let myColor;
    if (color) {
      myColor = {
        r: color.r,
        g: color.g,
        b: color.b,
      };
    } else {
      myColor = {
        r: 255,
        g: 223,
        b: 196,
      };
    }
    entities.push(new Player({
      x: 100,
      y: 100,
      angle: 0,
      size: 20,
      name: playerName,
      health: 20,
      color: myColor,
      client: true,
    })); // client

    // Find client
    for (const entity of entities) {
      if (!(entity instanceof Player)) continue;
      if (!entity.client) continue;
      client = entity;
    }

    socket = io.connect('http://142.161.99.156:4000/', { // Make connection
      reconnect: true,
    });

    socket.emit('new_player', { // We join a server, we must now tell the server we are here..
      x: client.x,
      y: client.y,
      size: client.size,
      name: client.name,
      health: client.health,
      color: color,
    });

    listener();

    creatingPlayer = false;
    playing = true;
  }
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

function drawZombies() {
  for (zombie of zombies) new Zombie(zombie).draw();
}

function drawPlayers() {
  for (player of players) { // Other clients
    if (player.id == id) continue; // Do not draw this client, only draw other clients
    new Player(player).draw();
  }
}

function drawServerMessages() {
  for (const message of messages) {
    for (const player of players) {
      if (player.id != message.id) continue;
      if (player.id == id) continue;
      new Player(player).drawMessage(message.text);
    }
  }
}

function drawClientMessages() {
  for (const message of messages) {
    if (message.id != id) continue;
    client.drawMessage(message.text);
  }
}

function keyPressed() {
  if (!playing) return;
  if (isChatVisible() === 'block') {
    if (keyCode == ENTER) {
      socket.emit('text', {
        text: getChatText(),
        id: id,
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
        name: client.name,
        health: client.health,
        angle: client.angle,
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

  socket.on('zombie_update', function(data) {
    zombies = data;
  });
}

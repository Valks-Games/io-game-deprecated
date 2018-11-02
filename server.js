const express = require('express');
const socket = require('socket.io');
const config = require('./config.json');

// App setup
const app = express();
const server = app.listen(4000, () => {
  console.log('Server is running on port 4000');
});

// Static files
app.use(express.static('public'));

// Socket setup
const io = socket(server); // Waiting for client. Listen out for when the connection is made..

// Classes
const Player = require('./classes/player.js');
const Zombie = require('./classes/zombie.js');

const players = [];
const zombies = [];
const messages = [];
const timeouts = [];

let sendData = false;

let storedZombies = [];

let a = 0;

setInterval(() => {
  for (const zombie of zombies) { // loop through each zombie
    zombie.findTarget(players); // find nearest player
    if (zombie.moveTowardsTarget()) {
      sendData = true;
    }
  }

  if (sendData) {
    console.log('sent some data ' + ++a);
    sendData = false;
    io.sockets.emit('zombie_update', zombies);
  }
}, 33);

initZombies();

function initZombies() {
  for (let i = 0; i < config.zombies; i++) {
    const zombie = new Zombie({
      x: Math.random() * config.world.width,
      y: Math.random() * config.world.height,
      angle: 0,
      size: 20,
      health: 20,
      speed: 5,
      spotRange: 50,
    });
    zombies.push(zombie);
  }
}

io.on('connection', (socket) => {
  socket.on('new_player', (data) => {
    const player = new Player({
      id: socket.id,
      x: data.x,
      y: data.y,
      size: data.size,
      name: data.name,
      health: data.health,
      angle: 0,
      color: data.color,
    });
    players.push(player);

    io.sockets.emit('client_ids', players); // Emit data because all clients need to see new client..
    io.sockets.emit('zombie_update', zombies);

    socket.emit('handshake', socket.id); // So the client can tell what id they are..

    console.log(`${socket.id} joined. (${players.length} players total)`);
  });

  socket.on('player_update', (data) => {
    for (const player of players) {
      if (player.id != socket.id) continue; // This is how we tell which player to update..
      player.x = data.x;
      player.y = data.y;
      player.health = data.health;
      player.angle = data.angle;
    }
    io.sockets.emit('client_ids', players);
  });

  socket.on('text', (data) => {
    const message = new Message(data.id, data.text);
    for (const message of messages) { // Remove dupelicate messages.
      if (message.id != data.id) continue;
      const index = messages.indexOf(message);
      messages.splice(index, 1);
    }

    for (const timeout of timeouts) { // Remove previous timeout for previous sent message if any
      if (timeout.id != data.id) continue;
      clearTimeout(timeout.timeout);
    }

    message.initLife(); // Start message lifetime..
    messages.push(message);

    io.sockets.emit('messages', messages); // Only emit data if needed like on this line but not every 33 ms!!
  });

  socket.on('disconnect', () => {
    for (const player of players) {
      if (player.id != socket.id) continue;
      const index = players.indexOf(player);
      players.splice(index, 1);
    }

    io.sockets.emit('client_ids', players); // Emit data because all clients no longer need to see old client..

    console.log(`${socket.id} left. (${players.length} players total)`);
  });
});

function Message(id, text) {
  this.id = id;
  this.text = text;

  this.initLife = function() {
    const timeout = setTimeout(
        () => {
          for (const message of messages) {
            if (message.id != id) continue;
            const index = messages.indexOf(message);
            messages.splice(index, 1);
            io.sockets.emit('messages', messages); // Update for all other clients..
          }
        }, 6000); // lifetime in ms of message being displayed..
    timeouts.push({
      timeout,
      id,
    });
  };
}

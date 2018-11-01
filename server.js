var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(4000, function() {
	console.log('Server is running on port 4000');
});

// Static files
app.use(express.static('public'));

// Socket setup
var io = socket(server); // Waiting for client. Listen out for when the connection is made..

let players = [];

function Player(id, x, y, size, name, health, angle) { // Created to simplify things..
  this.id = id;
  this.x = x;
  this.y = y;
  this.size = size;
  this.name = name;
  this.health = health;
  this.angle = angle;
}

io.on('connection', function(socket) {
	socket.on('new_player', function(data) {
		let player = new Player(socket.id, data.x, data.y, data.size, data.name, data.health, 0);
		players.push(player);
		
		console.log(players);

		io.sockets.emit('client_ids', players); // Emit data because all clients need to see new client..

		socket.emit('handshake', socket.id);

		//io.sockets.emit('zombies_update', zombies); // Players need to see the zombie positions for the first time otherwise they will be invisible!
		//io.sockets.emit('trees', trees); // Trees

		console.log(socket.id + " joined. (" + players.length + " players total)");
	});
	
	socket.on('player_update', function(data) {
		// This is how we tell which player to update..
		for (let player of players) {
		  if (player.id == socket.id) {
			player.x = data.x;
			player.y = data.y;
			player.size = data.size;
			player.health = data.health;
			player.angle = data.angle;
		  }
		}
		io.sockets.emit('client_ids', players);
	});
	
	socket.on('disconnect', function() {
		for (const player of players) {
		  if (player.id === socket.id) {
			const index = players.indexOf(player);
			players.splice(index, 1);
		  }
		}

		io.sockets.emit('client_ids', players); // Emit data because all clients no longer need to see old client..

		console.log(socket.id + " left. (" + players.length + " players total)");
	});
	//console.log(socket.id + " joined.");
});


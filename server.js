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

var Player = require('./classes/player.js');

let players = [];

io.on('connection', function(socket) {
	socket.on('new_player', function(data) {
		let player = new Player(socket.id, data.x, data.y, data.size, data.name, data.health, 0);
		players.push(player);

		io.sockets.emit('client_ids', players); // Emit data because all clients need to see new client..

		socket.emit('handshake', socket.id); // So the client can tell what id they are..

		console.log(socket.id + " joined. (" + players.length + " players total)");
	});
	
	socket.on('player_update', function(data) {
		for (let player of players) { 
		  if (player.id == socket.id) { // This is how we tell which player to update..
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
});
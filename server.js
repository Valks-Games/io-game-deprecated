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

// Classes
var Player = require('./classes/player.js');

let players = [];
let messages = [];
let timeouts = [];

io.on('connection', function(socket) {
	socket.on('new_player', function(data) {
		let player = new Player({
			id: socket.id,
			x: data.x,
			y: data.y,
			size: data.size,
			name: data.name,
			health: data.health,
			angle: 0,
			color: data.color
		});
		players.push(player);

		io.sockets.emit('client_ids', players); // Emit data because all clients need to see new client..

		socket.emit('handshake', socket.id); // So the client can tell what id they are..

		console.log(socket.id + " joined. (" + players.length + " players total)");
	});

	socket.on('player_update', function(data) {
		for (let player of players) {
			if (player.id != socket.id) continue; // This is how we tell which player to update..
			player.x = data.x;
			player.y = data.y;
			player.health = data.health;
			player.angle = data.angle;
		}
		io.sockets.emit('client_ids', players);
	});

	socket.on('text', function(data) {
		let message = new Message(data.id, data.text);
		for (let message of messages) { // Remove dupelicate messages.
			if (message.id != data.id) continue;
			let index = messages.indexOf(message);
			messages.splice(index, 1);
		}

		for (let timeout of timeouts) { // Remove previous timeout for previous sent message if any
			if (timeout.id != data.id) continue;
			clearTimeout(timeout.timeout);
		}

		message.initLife(); // Start message lifetime..
		messages.push(message);

		io.sockets.emit('messages', messages); // Only emit data if needed like on this line but not every 33 ms!!
	});

	socket.on('disconnect', function() {
		for (const player of players) {
			if (player.id != socket.id) continue;
			const index = players.indexOf(player);
			players.splice(index, 1);
		}

		io.sockets.emit('client_ids', players); // Emit data because all clients no longer need to see old client..

		console.log(socket.id + " left. (" + players.length + " players total)");
	});
});

function Message(id, text) {
	this.id = id;
	this.text = text;

	this.initLife = function() {
		let timeout = setTimeout(
			function() {
				for (const message of messages) {
					if (message.id != id) continue;
					let index = messages.indexOf(message);
					messages.splice(index, 1);
					io.sockets.emit('messages', messages); // Update for all other clients..
				}
			}, 6000); // lifetime in ms of message being displayed..
		timeouts.push({
			timeout: timeout,
			id: id
		});
	}
}
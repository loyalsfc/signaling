// server.js
const express = require('express');
const http = require('http');
const { ExpressPeerServer, PeerServer } = require('peer');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);


// Set up express middleware
app.use(cors()); // Enable CORS for all routes

const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.use("/peerjs", peerServer);

// Set up CORS options
const io = new Server(server, {
    cors: {
        origin: "*", // Replace with your client URL
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true // Allow cookies to be sent with requests
    }
});

io.on('connection', socket => {
    console.log('A user connected:', socket.id);

	socket.on('join-room', (roomId, remoteUserId) => {
		socket.join(roomId);
        
		socket.to(roomId).emit('user-connected', remoteUserId);

		socket.on('message', message => {
			socket.to(roomId).emit('message', message, remoteUserId)
		});

		socket.on('mute-video', status => {
			socket.to(roomId).emit('mute-video', status, remoteUserId)
		});

		socket.on('mute-audio', status => {
			socket.to(roomId).emit('mute-audio', status, remoteUserId)
		});


		socket.on('disconnect', () => {
			socket.to(roomId).emit('user-disconnected', remoteUserId);
		});
	});
});

server.listen(3002, () => {
    console.log('listening on *:3002');
});

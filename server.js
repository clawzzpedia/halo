const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Railway WebSocket config
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    path: '/socket.io/'
});

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
let userCount = 0;

io.on('connection', (socket) => {
    userCount++;
    console.log(`✅ User ${userCount}: ${socket.id}`);
    io.emit('userCount', userCount);
    
    socket.on('chatMessage', (data) => {
        io.emit('message', data);
    });
    
    socket.on('disconnect', () => {
        userCount = Math.max(0, userCount - 1);
        io.emit('userCount', userCount);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Chat server: PORT ${PORT}`);
});

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let userCount = 0;

io.on('connection', (socket) => {
    userCount++;
    console.log(`✅ User ${userCount} terhubung: ${socket.id}`);
    io.emit('userCount', userCount); // Broadcast user count
    
    socket.on('chatMessage', (data) => {
        console.log('💬', data.username, ':', data.message);
        io.emit('message', data);
    });
    
    socket.on('disconnect', () => {
        userCount = Math.max(0, userCount - 1);
        console.log(`❌ User keluar. Total: ${userCount}`);
        io.emit('userCount', userCount); // Update count
    });
});

server.listen(3000, () => {
    console.log('🚀 Server: http://localhost:3000');
});

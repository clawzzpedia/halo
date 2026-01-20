const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    console.log('User terhubung:', socket.id);
    
    socket.on('chatMessage', (data) => {
        io.emit('message', data); // Broadcast ke semua user
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnect:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});

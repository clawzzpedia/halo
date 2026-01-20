const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { 
    cors: { origin: "*" }, 
    path: '/socket.io/' 
});

// Upload foto (RAM only - Railway free)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
let userCount = 0;

io.on('connection', (socket) => {
    userCount++;
    io.emit('userCount', userCount);
    
    socket.on('chatMessage', (data) => io.emit('message', data));
    socket.on('imageMessage', (data) => io.emit('imageMessage', data));
    
    socket.on('disconnect', () => {
        userCount = Math.max(0, userCount - 1);
        io.emit('userCount', userCount);
    });
});

// API upload foto
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    const imageBuffer = req.file.buffer.toString('base64');
    res.json({ 
        image: `data:${req.file.mimetype};base64,${imageBuffer}` 
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server: PORT ${PORT}`);
});

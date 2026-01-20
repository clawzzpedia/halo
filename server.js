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

// GLOBAL CHAT HISTORY (RAM - max 1000 pesan)
let chatHistory = [];
const MAX_HISTORY = 1000;

// User sessions (per user chat view)
const userSessions = new Map();

const storage = multer.memoryStorage();
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 } 
});

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
let userCount = 0;

io.on('connection', (socket) => {
    const userId = socket.id;
    userCount++;
    io.emit('userCount', userCount);
    
    // Init user session
    userSessions.set(userId, { 
        history: chatHistory.slice(-50), 
        deleted: false 
    });
    
    // Send initial history to user
    socket.emit('chatHistory', chatHistory.slice(-50));
    
    socket.on('chatMessage', (data) => {
        const msg = { type: 'text', username: data.username, message: data.message, timestamp: new Date() };
        chatHistory.push(msg);
        if (chatHistory.length > MAX_HISTORY) chatHistory.shift();
        io.emit('message', msg);
    });
    
    socket.on('imageMessage', (data) => {
        const msg = { type: 'image', username: data.username, image: data.image, timestamp: new Date() };
        chatHistory.push(msg);
        if (chatHistory.length > MAX_HISTORY) chatHistory.shift();
        io.emit('imageMessage', msg);
    });
    
    // DELETE ALL CHAT - hanya untuk user ini
    socket.on('clearChat', () => {
        const session = userSessions.get(userId);
        if (session) {
            session.deleted = true;
            socket.emit('chatCleared');
        }
    });
    
    socket.on('disconnect', () => {
        userSessions.delete(userId);
        userCount = Math.max(0, userCount - 1);
        io.emit('userCount', userCount);
    });
});

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const imageBuffer = req.file.buffer.toString('base64');
    res.json({ image: `data:${req.file.mimetype};base64,${imageBuffer}` });
});

server.listen(PORT, () => {
    console.log(`🚀 Server: PORT ${PORT} | History: ${MAX_HISTORY} pesan`);
});

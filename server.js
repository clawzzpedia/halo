const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { 
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Route utama - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('✅ User terhubung:', socket.id);
    
    // Terima pesan dari client
    socket.on('chatMessage', (data) => {
        console.log('💬 Pesan:', data.username, '-', data.message);
        // Kirim ke SEMUA client (broadcast)
        io.emit('message', data);
    });
    
    socket.on('disconnect', () => {
        console.log('❌ User keluar:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server jalan: http://localhost:${PORT}`);
    console.log('📱 Buka di browser sekarang!');
});

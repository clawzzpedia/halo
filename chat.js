const socket = io('http://localhost:3000');
let username = document.getElementById('username').value || 'Anon' + Math.floor(Math.random() * 1000);

document.getElementById('username').addEventListener('input', (e) => {
    username = e.target.value || 'Anon' + Math.floor(Math.random() * 1000);
});

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (message) {
        socket.emit('chatMessage', { username, message });
        input.value = '';
    }
}

socket.on('message', (data) => {
    const messages = document.getElementById('messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';
    msgDiv.innerHTML = `<span class="username">${data.username}:</span> ${data.message}`;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
});

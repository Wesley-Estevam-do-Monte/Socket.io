const express = require('express');
const path = require('path');
const http = require('http');
const { dirname } = require('path');
const socketIO = require('socket.io');
const { connected } = require('process');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')))

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
})

let userConect = [];

io.on('connection', (socket) => {
    console.log("Conexão detectada...");

    socket.on('join-request', (username) => {
        socket.username = username;
        userConect.push(username);
        console.log(userConect);

        socket.emit('user-ok', userConect);

        socket.broadcast.emit('list-update', {
            joined: username,
            list: userConect
        });
    });

    socket.on('disconnect', () => {
        userConect = userConect.filter(u => u != socket.username);
        console.log(userConect);


        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: userConect
        })
    })

    socket.on('send-msg', (txt) => {
        let obj = {
            username: socket.username,
            msg: txt
        }

        //socket.emit('show-msg', obj);
        socket.broadcast.emit('show-msg', obj);
    })
});

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

let users = {};

  io.on('connection', (socket) => {
console.log('Nuevo usuario conectado');
    socket.on('nuevo usuario', (data, cb) => {
      if (data in users) {
        cb(false);
      } else {
        cb(true);
        socket.nickname = data;
        users[socket.nickname] = socket;
        updateNicknames();
      }
    });

    // receive a message a broadcasting
    socket.on('enviar mensaje', (data, cb) => {
      var msg = data.trim();

      if (msg.substr(0, 3) === '/w ') {
        msg = msg.substr(3);
        var index = msg.indexOf(' ');
        if(index !== -1) {
          var name = msg.substring(0, index);
          var msg = msg.substring(index + 1);
          if (name in users) {
            users[name].emit('privado', {
              msg,
              nick: socket.nickname 
            });
          } else {
            cb('Ingresa un usuario valido');
          }
        } else {
          cb('Ingresa tu mensaje');
        }
      } else {
        io.sockets.emit('nuevo mensaje', {
          msg,
          nick: socket.nickname
        });

      }
    });

   socket.on('user image', function(image){
    io.sockets.emit('addimagen', socket.nickname, image);
        });

    socket.on('stream', (imagen) =>{

      socket.broadcast.emit('stream', imagen);
    });

    socket.on('disconnect', data => {
      if(!socket.nickname) return;
      delete users[socket.nickname];
      updateNicknames();
    });

    function updateNicknames() {
      io.sockets.emit('usernames', Object.keys(users));
    }
  });

server.listen(3000, () => {
  console.log('Escuchando desde el puerto 3000');
});



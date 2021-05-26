const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/templates'));

app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const rootRoute = require('./routes/rootRoute');

const mainSocket = require('./socket/mainSocket');
const gameSocket = require('./socket/gameSocket');

app.use('/', rootRoute);

mainSocket(io);
gameSocket.update(io);

server.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT} and hosted by ${HOST}.`);
});
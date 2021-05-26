const gameSocket = require('./gameSocket');

const mainSocket = (io) => {
    io.on('connection', (socket) => {
        gameSocket.listenSockets(io, socket);
    });
}

module.exports = mainSocket;
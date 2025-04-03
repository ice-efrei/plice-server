const { WebSocketServer } = require('ws');

const setupWebSocket = (server, getScreenString, broadcastChange) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (socket) => {
        console.log("Client connected to WebSocket");

        socket.on('message', () => {
            socket.send("0" + getScreenString());
        });
    });

    return {
        broadcastChange: (x, y, value) => {
            wss.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(`1${x.toString().padStart(2, '0')}${y.toString().padStart(2, '0')}${value}`);
                }
            });
        },
    };
};

module.exports = setupWebSocket;
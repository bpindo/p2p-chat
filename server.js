const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

const clients = new Map(); // id -> ws

wss.on('connection', ws => {
  let clientId = null;

  ws.on('message', msg => {
    const data = JSON.parse(msg);

    // 1️⃣ Register user
    if (data.type === 'register') {
      clientId = data.id;
      clients.set(clientId, ws);

      // kirim daftar peer ke client baru
      ws.send(JSON.stringify({
        type: 'peers',
        peers: [...clients.keys()]
      }));

      // update peer lain
      clients.forEach((client, id) => {
        if (id !== clientId) {
          client.send(JSON.stringify({
            type: 'peers',
            peers: [...clients.keys()]
          }));
        }
      });
      return;
    }

    // 2️⃣ Relay signaling
    if (data.to && clients.has(data.to)) {
      clients.get(data.to).send(JSON.stringify(data));
    }
  });

  ws.on('close', () => {
    if (clientId) {
      clients.delete(clientId);
    }
  });
});

console.log('WebSocket signaling server running');

const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

const clients = new Map();

wss.on("connection", ws => {
  let clientId = null;

  ws.on("message", message => {
    const data = JSON.parse(message);

    // registrasi client
    if (data.type === "register") {
      clientId = data.id;
      clients.set(clientId, ws);

      console.log("REGISTER:", clientId);

      // kirim daftar peer ke semua client
      const peers = [...clients.keys()];
      clients.forEach(c => {
        c.send(JSON.stringify({ type: "peers", peers }));
      });
      return;
    }

    // forward signaling
    if (data.to && clients.has(data.to)) {
      clients.get(data.to).send(JSON.stringify(data));
    }
  });

  ws.on("close", () => {
    if (clientId) {
      clients.delete(clientId);
      console.log("DISCONNECT:", clientId);

      const peers = [...clients.keys()];
      clients.forEach(c => {
        c.send(JSON.stringify({ type: "peers", peers }));
      });
    }
  });
});

console.log("WebSocket signaling server running on port", PORT);

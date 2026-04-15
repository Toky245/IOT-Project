// Service WebSocket pour la communication temps reel

const WebSocket = require('ws');
const positionStore = require('../store/positionStore');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.init();
  }

  init() {
    this.wss.on('connection', (ws) => {
      console.log('[WS] Client connecte');

      // Envoyer l'historique au nouveau client
      const history = positionStore.getAll();
      ws.send(JSON.stringify({ type: 'history', data: history }));

      ws.on('close', () => {
        console.log('[WS] Client deconnecte');
      });
    });
  }

  // Diffuser une position a tous les clients connectes
  broadcast(position) {
    const message = JSON.stringify({ type: 'position', data: position });
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Notifier tous les clients d'un reset
  broadcastClear() {
    const message = JSON.stringify({ type: 'clear' });
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

module.exports = WebSocketService;

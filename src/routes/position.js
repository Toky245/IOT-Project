// Routes API pour la gestion des positions GPS

const express = require('express');
const router = express.Router();
const positionStore = require('../store/positionStore');

let wsService = null;

// Injection du service WebSocket
function setWebSocketService(service) {
  wsService = service;
}

// POST /api/position - Recevoir une nouvelle position
router.post('/', (req, res) => {
  const { lat, lng } = req.body;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'lat et lng sont requis' });
  }

  const position = positionStore.add(req.body);

  if (wsService) {
    wsService.broadcast(position);
  }

  console.log(`[GPS] ${position.lat}, ${position.lng}`);
  res.json({ status: 'ok', position });
});

// GET /api/positions - Recuperer l'historique
router.get('/', (req, res) => {
  res.json(positionStore.getAll());
});

// DELETE /api/positions - Effacer l'historique
router.delete('/', (req, res) => {
  positionStore.clear();

  if (wsService) {
    wsService.broadcastClear();
  }

  res.json({ status: 'cleared' });
});

module.exports = { router, setWebSocketService };

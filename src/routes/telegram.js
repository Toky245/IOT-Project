// Routes API pour le bot Telegram

const express = require('express');
const router = express.Router();
const positionStore = require('../store/positionStore');

let telegramService = null;

function setTelegramService(service) {
  telegramService = service;
}

// GET /api/telegram/status - Verifier si le bot est configure
router.get('/status', (req, res) => {
  res.json({
    enabled: telegramService ? telegramService.isEnabled() : false
  });
});

// POST /api/telegram/send - Envoyer la derniere position
router.post('/send', async (req, res) => {
  if (!telegramService || !telegramService.isEnabled()) {
    return res.status(400).json({ error: 'Telegram non configure' });
  }

  const positions = positionStore.getAll();
  if (positions.length === 0) {
    return res.status(404).json({ error: 'Aucune position disponible' });
  }

  const lastPosition = positions[positions.length - 1];

  try {
    await telegramService.sendPosition(lastPosition);
    await telegramService.sendLocation(lastPosition);
    console.log('[Telegram] Position envoyee');
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[Telegram] Erreur:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/telegram/alert - Envoyer une alerte geofencing
router.post('/alert', async (req, res) => {
  if (!telegramService || !telegramService.isEnabled()) {
    return res.status(400).json({ error: 'Telegram non configure' });
  }

  const { lat, lng } = req.body;
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'lat et lng sont requis' });
  }

  try {
    await telegramService.sendGeofenceAlert({ lat, lng });
    console.log('[Telegram] Alerte geofence envoyee');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, setTelegramService };

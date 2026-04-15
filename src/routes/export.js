// Routes API pour l'export des donnees GPS

const express = require('express');
const router = express.Router();
const positionStore = require('../store/positionStore');

// GET /api/export/csv - Exporter l'historique en CSV
router.get('/csv', (req, res) => {
  const positions = positionStore.getAll();

  if (positions.length === 0) {
    return res.status(404).json({ error: 'Aucune donnee a exporter' });
  }

  const header = 'latitude,longitude,vitesse_kmh,altitude_m,timestamp\n';
  const rows = positions.map(p =>
    `${p.lat},${p.lng},${p.speed},${p.altitude},${p.timestamp}`
  ).join('\n');

  const csv = header + rows;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=gps_tracker_export.csv');
  res.send(csv);
});

// GET /api/export/json - Exporter l'historique en JSON
router.get('/json', (req, res) => {
  const positions = positionStore.getAll();

  if (positions.length === 0) {
    return res.status(404).json({ error: 'Aucune donnee a exporter' });
  }

  res.setHeader('Content-Disposition', 'attachment; filename=gps_tracker_export.json');
  res.json(positions);
});

module.exports = router;

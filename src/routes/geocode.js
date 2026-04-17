// Route proxy pour le reverse geocoding via Nominatim

const express = require('express');
const https = require('https');
const router = express.Router();

// GET /api/geocode?lat=...&lon=...
router.get('/', (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat et lon requis' });
  }

  const url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2' +
    '&lat=' + lat + '&lon=' + lon +
    '&zoom=18&addressdetails=1&accept-language=fr';

  const options = {
    headers: { 'User-Agent': 'Localiseo-IOT-SchoolProject/1.0' }
  };

  https.get(url, options, (apiRes) => {
    let body = '';
    apiRes.on('data', (chunk) => { body += chunk; });
    apiRes.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.json(data);
      } catch (e) {
        res.status(502).json({ error: 'Reponse invalide de Nominatim' });
      }
    });
  }).on('error', () => {
    res.status(502).json({ error: 'Impossible de contacter Nominatim' });
  });
});

module.exports = router;

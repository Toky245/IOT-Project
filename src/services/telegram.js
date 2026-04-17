// Service Telegram Bot pour les notifications GPS

const https = require('https');
const config = require('../config');

class TelegramService {
  constructor() {
    this.token = config.telegram.token;
    this.chatId = config.telegram.chatId;
    this.enabled = !!(this.token && this.chatId);

    if (this.enabled) {
      console.log('[Telegram] Bot configure');
    } else {
      console.log('[Telegram] Non configure (definir TELEGRAM_TOKEN et TELEGRAM_CHAT_ID)');
    }
  }

  // Envoyer un message texte
  sendMessage(text) {
    if (!this.enabled) return Promise.resolve(null);

    return this._request('sendMessage', {
      chat_id: this.chatId,
      text: text,
      parse_mode: 'HTML'
    });
  }

  // Envoyer la position avec un lien vers Localiseo
  sendPosition(position) {
    var appUrl = 'https://localiseo.onrender.com';
    var text = '<b>Localiseo - Position</b>\n\n' +
      'Lat: <code>' + position.lat + '</code>\n' +
      'Lng: <code>' + position.lng + '</code>\n' +
      'Vitesse: ' + position.speed + ' km/h\n' +
      'Altitude: ' + position.altitude + ' m\n' +
      'Heure: ' + new Date(position.timestamp).toLocaleTimeString('fr-FR') + '\n\n' +
      '<a href="' + appUrl + '">Voir en temps reel sur Localiseo</a>';

    return this.sendMessage(text);
  }

  // Envoyer une alerte de geofencing
  sendGeofenceAlert(position) {
    var appUrl = 'https://localiseo.onrender.com';
    var text = '<b>ALERTE - Sortie de zone !</b>\n\n' +
      'Le tracker a quitte la zone de securite.\n\n' +
      'Lat: <code>' + position.lat + '</code>\n' +
      'Lng: <code>' + position.lng + '</code>\n\n' +
      '<a href="' + appUrl + '">Voir en temps reel sur Localiseo</a>';

    return this.sendMessage(text);
  }

  // Envoyer la position sous forme de localisation Telegram
  sendLocation(position) {
    if (!this.enabled) return Promise.resolve(null);

    return this._request('sendLocation', {
      chat_id: this.chatId,
      latitude: position.lat,
      longitude: position.lng
    });
  }

  // Requete HTTP vers l'API Telegram
  _request(method, params) {
    return new Promise((resolve, reject) => {
      var data = JSON.stringify(params);

      var options = {
        hostname: 'api.telegram.org',
        path: '/bot' + this.token + '/' + method,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      var req = https.request(options, (res) => {
        var body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  isEnabled() {
    return this.enabled;
  }
}

module.exports = TelegramService;

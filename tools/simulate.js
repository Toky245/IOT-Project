// Simulateur GPS - Simule un trajet a Antananarivo
// Utilisation : npm run simulate

var http = require('http');

// Point de depart : Analakely, Antananarivo
var lat = -18.9100;
var lng = 47.5255;

// Generer un deplacement aleatoire realiste
function getNextPosition() {
  lat += (Math.random() - 0.45) * 0.001;
  lng += (Math.random() - 0.45) * 0.001;

  return {
    lat: lat.toFixed(6),
    lng: lng.toFixed(6),
    speed: (Math.random() * 40 + 5).toFixed(1),
    altitude: (1200 + Math.random() * 50).toFixed(1)
  };
}

// Envoyer une position au serveur
function sendPosition() {
  var pos = getNextPosition();
  var data = JSON.stringify(pos);

  var options = {
    hostname: 'localhost',
    port: 4900,
    path: '/api/position',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  var req = http.request(options, function (res) {
    var body = '';
    res.on('data', function (chunk) { body += chunk; });
    res.on('end', function () {
      console.log('[SIM] lat=' + pos.lat + ', lng=' + pos.lng + ', speed=' + pos.speed + ' km/h');
    });
  });

  req.on('error', function () {
    console.error('[ERR] Le serveur est-il demarre ? (npm start)');
  });

  req.write(data);
  req.end();
}

console.log('Simulateur GPS demarre');
console.log('Trajet simule a Antananarivo, envoi toutes les 2s');
console.log('');

setInterval(sendPosition, 2000);
sendPosition();

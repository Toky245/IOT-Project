// Point d'entree de l'application frontend

(function () {

  var DEFAULT_CENTER = { lat: -18.9100, lng: 47.5255 };

  var positions = [];
  var totalDistance = 0;

  MapManager.init('map', DEFAULT_CENTER);
  Geofence.init(MapManager.getMap());
  Replay.init(MapManager.getMap());

  // Traitement d'une nouvelle position
  function handlePosition(pos) {
    if (positions.length > 0) {
      var prev = positions[positions.length - 1];
      totalDistance += Utils.haversineDistance(prev.lat, prev.lng, pos.lat, pos.lng);
    }

    positions.push(pos);
    MapManager.updatePosition(pos.lat, pos.lng);
    Sidebar.update(pos, { count: positions.length, distance: totalDistance });

    document.getElementById('signal').classList.add('active');

    // Verification geofencing
    var breaches = Geofence.checkPosition(pos.lat, pos.lng);
    var alertBox = document.getElementById('geofence-alert');
    if (breaches.length > 0) {
      alertBox.style.display = 'flex';
    } else {
      alertBox.style.display = 'none';
    }
  }

  // Chargement de l'historique
  function handleHistory(data) {
    data.forEach(function (pos) {
      handlePosition(pos);
    });
  }

  // Reinitialisation
  function handleClear() {
    positions = [];
    totalDistance = 0;
    MapManager.clear();
    Sidebar.reset();
    document.getElementById('signal').classList.remove('active');
    document.getElementById('geofence-alert').style.display = 'none';
  }

  // WebSocket
  WS.onPosition(handlePosition);
  WS.onHistory(handleHistory);
  WS.onClear(handleClear);
  WS.connect();

  // Alerte geofence -> notification visuelle + Telegram
  Geofence.onBreach(function (breaches, lat, lng) {
    Toast.warning('Alerte Geofencing', 'Le tracker a quitte la zone de securite');
    fetch('/api/telegram/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: lat, lng: lng })
    }).catch(function () {});
  });

  // -- Boutons carte --

  document.getElementById('btn-center').addEventListener('click', function () {
    MapManager.centerOnMarker();
  });

  document.getElementById('btn-trail').addEventListener('click', function () {
    MapManager.toggleTrail();
  });

  document.getElementById('btn-geofence').addEventListener('click', function () {
    var drawing = Geofence.toggleDrawing();
    var btn = document.getElementById('btn-geofence');
    if (drawing) {
      btn.classList.add('map-btn-active');
    } else {
      btn.classList.remove('map-btn-active');
    }
  });

  document.getElementById('btn-clear').addEventListener('click', function () {
    Toast.confirm('Effacer l\'historique', 'Toutes les positions GPS seront supprimees.', function () {
      fetch('/api/positions', { method: 'DELETE' });
    });
  });

  // -- Boutons sidebar --

  // Geofencing
  document.getElementById('btn-add-zone').addEventListener('click', function () {
    Geofence.toggleDrawing();
    document.getElementById('btn-geofence').classList.add('map-btn-active');
  });

  document.getElementById('btn-clear-zones').addEventListener('click', function () {
    Toast.confirm('Supprimer les zones', 'Toutes les zones de geofencing seront supprimees.', function () {
      Geofence.clearAll();
      document.getElementById('geofence-alert').style.display = 'none';
    });
  });

  // Export
  document.getElementById('btn-export-csv').addEventListener('click', function () {
    window.location.href = '/api/export/csv';
  });

  document.getElementById('btn-export-json').addEventListener('click', function () {
    window.location.href = '/api/export/json';
  });

  // Telegram - bouton carte
  function sendTelegram() {
    fetch('/api/telegram/send', { method: 'POST' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.status === 'ok') {
          Toast.success('Telegram', 'Position envoyee avec succes');
        } else {
          Toast.error('Telegram', data.error || 'Erreur lors de l\'envoi');
        }
      })
      .catch(function () {
        Toast.error('Telegram', 'Bot non configure. Verifiez le fichier .env');
      });
  }

  document.getElementById('btn-telegram-map').addEventListener('click', sendTelegram);

  // Replay
  var replayPanel = document.getElementById('replay-panel');

  document.getElementById('btn-replay').addEventListener('click', function () {
    var state = Replay.getState();
    if (state.playing) {
      Replay.stop();
    } else {
      Replay.start(positions);
    }
  });

  document.getElementById('replay-pause').addEventListener('click', function () {
    Replay.togglePause();
  });

  document.getElementById('replay-stop').addEventListener('click', function () {
    Replay.stop();
  });

  document.getElementById('replay-speed').addEventListener('change', function () {
    Replay.setSpeed(parseFloat(this.value));
  });

  Replay.onStateChange(function (state) {
    if (state.playing) {
      replayPanel.style.display = 'flex';
      document.getElementById('replay-progress').textContent =
        state.index + ' / ' + state.total;
      document.getElementById('replay-pause-icon').textContent =
        state.paused ? 'play_arrow' : 'pause';
      document.getElementById('btn-replay').classList.add('map-btn-active');
    } else {
      replayPanel.style.display = 'none';
      document.getElementById('btn-replay').classList.remove('map-btn-active');
    }
  });

  // -- Historique etendu --
  document.getElementById('btn-history-expand').addEventListener('click', function () {
    // Construire le tableau complet
    var tableHTML = '<table class="history-table">' +
      '<thead><tr>' +
        '<th>#</th><th>Heure</th><th>Latitude</th><th>Longitude</th><th>Vitesse</th><th>Altitude</th>' +
      '</tr></thead><tbody>';

    positions.forEach(function (p, i) {
      tableHTML += '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + Utils.formatTime(p.timestamp) + '</td>' +
        '<td>' + parseFloat(p.lat).toFixed(6) + '</td>' +
        '<td>' + parseFloat(p.lng).toFixed(6) + '</td>' +
        '<td>' + parseFloat(p.speed || 0).toFixed(1) + ' km/h</td>' +
        '<td>' + parseFloat(p.altitude || 0).toFixed(0) + ' m</td>' +
      '</tr>';
    });

    tableHTML += '</tbody></table>';

    if (positions.length === 0) {
      tableHTML = '<div class="history-empty">Aucune donnee GPS enregistree</div>';
    }

    // Creer l'overlay + modal dans le body
    var overlay = document.createElement('div');
    overlay.className = 'history-overlay';
    overlay.id = 'history-overlay';

    var modal = document.createElement('div');
    modal.className = 'history-modal';
    modal.id = 'history-modal';

    modal.innerHTML =
      '<div class="history-expanded-header">' +
        '<div class="history-expanded-title">' +
          '<span class="material-symbols-outlined panel-icon">history</span>' +
          '<h3>Historique GPS</h3>' +
          '<span class="history-count">' + positions.length + ' positions</span>' +
        '</div>' +
        '<button class="history-close-btn" id="btn-history-close">' +
          '<span class="material-symbols-outlined">close</span>' +
        '</button>' +
      '</div>' +
      '<div class="history-table-wrap">' + tableHTML + '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Forcer le reflow puis animer
    overlay.offsetHeight;
    overlay.classList.add('visible');
    modal.classList.add('visible');

    // Fermeture
    function closeExpanded() {
      modal.classList.remove('visible');
      overlay.classList.remove('visible');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      }, 300);
    }

    document.getElementById('btn-history-close').addEventListener('click', closeExpanded);
    overlay.addEventListener('click', closeExpanded);
  });

  // -- Theme --
  var themeIcon = document.getElementById('theme-icon');
  var currentTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(currentTheme);

  document.getElementById('btn-theme').addEventListener('click', function () {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  }

  // -- Navigation mobile --
  var mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
  var sidebar = document.getElementById('sidebar');

  mobileNavBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tab = this.getAttribute('data-tab');

      mobileNavBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      if (tab === 'sidebar' || tab === 'history') {
        sidebar.classList.add('mobile-visible');
      } else {
        sidebar.classList.remove('mobile-visible');
      }

      MapManager.invalidateSize();
    });
  });

  // -- Tutoriel premiere utilisation --
  if (Tutorial.shouldShow()) {
    setTimeout(function () {
      Tutorial.start();
    }, 800);
  }

  // Bouton aide dans le header
  document.getElementById('btn-help').addEventListener('click', function () {
    Tutorial.reset();
  });

})();

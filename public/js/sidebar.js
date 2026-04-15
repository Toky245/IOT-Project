// Module de gestion du panneau lateral et barre de statut

var Sidebar = (function () {

  var MAX_HISTORY_ITEMS = 20;

  // Mettre a jour les informations affichees
  function update(position, stats) {
    setTextById('current-lat', parseFloat(position.lat).toFixed(6));
    setTextById('current-lng', parseFloat(position.lng).toFixed(6));
    setTextById('current-speed', parseFloat(position.speed || 0).toFixed(1));
    setTextById('current-alt', parseFloat(position.altitude || 0).toFixed(0) + ' m');
    setTextById('total-points', stats.count);
    setTextById('total-distance', Utils.formatDistance(stats.distance));
    setTextById('last-update', Utils.formatTime(position.timestamp));

    // Barre de statut
    updateStatusBar(position, stats);

    addHistoryItem(position);
  }

  // Mettre a jour la barre de statut en bas
  function updateStatusBar(position, stats) {
    var lat = parseFloat(position.lat).toFixed(4);
    var lng = parseFloat(position.lng).toFixed(4);
    setTextById('status-bar-coords', lat + ', ' + lng);
    setTextById('status-bar-points', stats.count + ' pts');
    setTextById('status-bar-text', 'Signal GPS actif');

    var dot = document.getElementById('status-bar-dot');
    dot.classList.add('online');
  }

  // Ajouter une entree dans l'historique
  function addHistoryItem(position) {
    var list = document.getElementById('history-list');
    var item = document.createElement('div');
    item.className = 'history-item';

    var time = Utils.formatTime(position.timestamp);
    var lat = parseFloat(position.lat).toFixed(4);
    var lng = parseFloat(position.lng).toFixed(4);
    item.innerHTML = '<span class="history-time">' + time + '</span> ' + lat + ', ' + lng;

    list.insertBefore(item, list.firstChild);

    while (list.children.length > MAX_HISTORY_ITEMS) {
      list.removeChild(list.lastChild);
    }
  }

  // Reinitialiser l'affichage
  function reset() {
    setTextById('current-lat', '--');
    setTextById('current-lng', '--');
    setTextById('current-speed', '--');
    setTextById('current-alt', '-- m');
    setTextById('total-points', '0');
    setTextById('total-distance', '0 m');
    setTextById('last-update', '--');
    setTextById('status-bar-coords', '--');
    setTextById('status-bar-points', '0 pts');
    setTextById('status-bar-text', 'En attente de signal GPS...');
    document.getElementById('status-bar-dot').classList.remove('online');
    document.getElementById('history-list').innerHTML = '';
  }

  // Raccourci pour definir le texte d'un element
  function setTextById(id, text) {
    document.getElementById(id).textContent = text;
  }

  return {
    update: update,
    reset: reset
  };

})();

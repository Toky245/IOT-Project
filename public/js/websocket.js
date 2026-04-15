// Module de connexion WebSocket

var WS = (function () {

  var socket = null;
  var onPositionCallback = null;
  var onHistoryCallback = null;
  var onClearCallback = null;

  var RECONNECT_DELAY = 3000;

  // Etablir la connexion
  function connect() {
    var protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(protocol + '//' + location.host);

    socket.onopen = function () {
      console.log('[WS] Connecte');
      setStatus(true);
    };

    socket.onclose = function () {
      console.log('[WS] Deconnecte');
      setStatus(false);
      setTimeout(connect, RECONNECT_DELAY);
    };

    socket.onmessage = function (event) {
      var msg = JSON.parse(event.data);

      switch (msg.type) {
        case 'position':
          if (onPositionCallback) onPositionCallback(msg.data);
          break;
        case 'history':
          if (onHistoryCallback) onHistoryCallback(msg.data);
          break;
        case 'clear':
          if (onClearCallback) onClearCallback();
          break;
      }
    };
  }

  // Mettre a jour l'indicateur de statut
  function setStatus(online) {
    var el = document.getElementById('status');
    el.textContent = online ? 'Connecte' : 'Deconnecte';
    el.className = online ? 'status-online' : 'status-offline';
  }

  // Definir les callbacks
  function onPosition(cb) { onPositionCallback = cb; }
  function onHistory(cb) { onHistoryCallback = cb; }
  function onClear(cb) { onClearCallback = cb; }

  return {
    connect: connect,
    onPosition: onPosition,
    onHistory: onHistory,
    onClear: onClear
  };

})();

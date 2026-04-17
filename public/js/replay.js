// Module de replay du trajet GPS sur la carte

var Replay = (function () {

  var isPlaying = false;
  var isPaused = false;
  var timer = null;
  var currentIndex = 0;
  var positions = [];
  var replayMarker = null;
  var replayTrailBorder = null;
  var replayTrail = null;
  var map = null;
  var speed = 1;
  var onStateChange = null;

  // Icone du marqueur replay
  var replayIcon = L.divIcon({
    html: '<div class="replay-marker">' +
      '<div class="replay-dot"></div>' +
    '</div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: 'replay-icon-wrapper'
  });

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '.replay-icon-wrapper{background:none!important;border:none!important}' +
      '.replay-marker{width:24px;height:24px;display:flex;align-items:center;justify-content:center}' +
      '.replay-dot{width:14px;height:14px;background:#fb8c00;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px rgba(251,140,0,0.3),0 2px 6px rgba(0,0,0,0.3)}';
    document.head.appendChild(style);
  }

  function init(leafletMap) {
    map = leafletMap;
    injectStyles();
  }

  // Demarrer le replay
  function start(positionData) {
    if (positionData.length < 2) {
      Toast.warning('Replay', 'Pas assez de positions pour rejouer le trajet');
      return;
    }

    stop();
    positions = positionData.slice();
    currentIndex = 0;
    isPlaying = true;
    isPaused = false;

    // Trajet du replay (orange)
    replayTrailBorder = L.polyline([], {
      color: '#ffffff',
      weight: 7,
      opacity: 0.5,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    replayTrail = L.polyline([], {
      color: '#fb8c00',
      weight: 4,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Placer le marqueur au debut
    var first = positions[0];
    replayMarker = L.marker([first.lat, first.lng], { icon: replayIcon }).addTo(map);
    replayTrailBorder.addLatLng([first.lat, first.lng]);
    replayTrail.addLatLng([first.lat, first.lng]);
    map.setView([first.lat, first.lng], map.getZoom(), { animate: true });

    notifyState();
    tick();
  }

  // Boucle d'animation
  function tick() {
    if (!isPlaying || isPaused) return;

    currentIndex++;
    if (currentIndex >= positions.length) {
      Toast.success('Replay', 'Trajet termine');
      stop();
      return;
    }

    var pos = positions[currentIndex];
    var latlng = [pos.lat, pos.lng];
    replayMarker.setLatLng(latlng);
    replayTrailBorder.addLatLng(latlng);
    replayTrail.addLatLng(latlng);
    map.setView(latlng, map.getZoom(), { animate: true });

    notifyState();

    // Intervalle selon la vitesse (base 500ms)
    var interval = Math.max(100, 500 / speed);
    timer = setTimeout(tick, interval);
  }

  // Pause / Reprendre
  function togglePause() {
    if (!isPlaying) return;
    isPaused = !isPaused;
    if (!isPaused) tick();
    notifyState();
  }

  // Arreter le replay
  function stop() {
    isPlaying = false;
    isPaused = false;
    currentIndex = 0;

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (replayMarker) {
      map.removeLayer(replayMarker);
      replayMarker = null;
    }
    if (replayTrailBorder) {
      map.removeLayer(replayTrailBorder);
      replayTrailBorder = null;
    }
    if (replayTrail) {
      map.removeLayer(replayTrail);
      replayTrail = null;
    }

    notifyState();
  }

  // Changer la vitesse
  function setSpeed(newSpeed) {
    speed = newSpeed;
    notifyState();
  }

  function notifyState() {
    if (onStateChange) {
      onStateChange({
        playing: isPlaying,
        paused: isPaused,
        index: currentIndex,
        total: positions.length,
        speed: speed
      });
    }
  }

  function getState() {
    return {
      playing: isPlaying,
      paused: isPaused,
      index: currentIndex,
      total: positions.length,
      speed: speed
    };
  }

  return {
    init: init,
    start: start,
    stop: stop,
    togglePause: togglePause,
    setSpeed: setSpeed,
    getState: getState,
    onStateChange: function (cb) { onStateChange = cb; }
  };

})();

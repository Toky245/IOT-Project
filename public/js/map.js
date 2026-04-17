// Module de gestion de la carte Leaflet avec couches multiples

var MapManager = (function () {

  var map = null;
  var marker = null;
  var trail = null;
  var trailBorder = null;
  var trailVisible = true;
  var followTracker = true;
  var layers = {};
  var currentLayer = null;

  // Style du marqueur avec effet pulse
  var trackerIcon = L.divIcon({
    html: '<div class="tracker-marker">' +
      '<div class="tracker-ping"></div>' +
      '<div class="tracker-dot"></div>' +
    '</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: 'tracker-icon-wrapper'
  });

  // Definir les couches disponibles
  function createLayers() {
    layers = {
      'Standard': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
      }),
      'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri',
        maxZoom: 18
      }),
      'Topographique': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenTopoMap',
        maxZoom: 17
      }),
      'Sombre': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        maxZoom: 19
      })
    };
  }

  // Injecter le CSS du marqueur
  function injectMarkerStyles() {
    var style = document.createElement('style');
    style.textContent =
      '.tracker-icon-wrapper{background:none!important;border:none!important}' +
      '.tracker-marker{position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center}' +
      '.tracker-dot{width:16px;height:16px;background:#4285F4;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px rgba(66,133,244,0.3),0 2px 8px rgba(0,0,0,0.3);position:relative;z-index:2}' +
      '.tracker-ping{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:rgba(66,133,244,0.25);animation:ping 2s ease-out infinite;z-index:1}' +
      '@keyframes ping{0%{width:16px;height:16px;opacity:1}100%{width:55px;height:55px;opacity:0}}';
    document.head.appendChild(style);
  }

  // Configurer le selecteur de couche custom
  function initLayerSwitcher() {
    var toggleBtn = document.getElementById('layer-toggle');
    var menu = document.getElementById('layer-menu');
    var options = menu.querySelectorAll('.layer-option');

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('open');
    });

    // Fermer le menu au clic en dehors
    document.addEventListener('click', function () {
      menu.classList.remove('open');
    });

    menu.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    options.forEach(function (option) {
      option.addEventListener('click', function () {
        var name = this.getAttribute('data-layer');
        switchLayer(name);

        // Mettre a jour l'etat actif
        options.forEach(function (o) { o.classList.remove('active'); });
        this.classList.add('active');
        menu.classList.remove('open');
      });
    });
  }

  // Changer de couche de carte
  function switchLayer(name) {
    if (currentLayer) {
      map.removeLayer(currentLayer);
    }
    currentLayer = layers[name];
    map.addLayer(currentLayer);
  }

  // Initialiser la carte
  function init(elementId, center) {
    injectMarkerStyles();
    createLayers();

    currentLayer = layers['Standard'];

    map = L.map(elementId, {
      center: [center.lat, center.lng],
      zoom: 15,
      zoomControl: true,
      layers: [currentLayer]
    });

    // Bordure blanche pour le contraste sur tous les fonds
    trailBorder = L.polyline([], {
      color: '#ffffff',
      weight: 8,
      opacity: 0.6,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Ligne principale bleue (style Google Maps)
    trail = L.polyline([], {
      color: '#4285F4',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    map.on('dragstart', function () {
      followTracker = false;
    });

    initLayerSwitcher();
  }

  // Mettre a jour la position du marqueur
  function updatePosition(lat, lng) {
    var latlng = [lat, lng];

    if (!marker) {
      marker = L.marker(latlng, { icon: trackerIcon }).addTo(map);
      marker.bindPopup('<b>Localiseo</b><br>Position en direct');
    } else {
      marker.setLatLng(latlng);
    }

    trailBorder.addLatLng(latlng);
    trail.addLatLng(latlng);

    if (followTracker) {
      map.setView(latlng, map.getZoom(), { animate: true });
    }
  }

  // Centrer la carte sur le marqueur
  function centerOnMarker() {
    followTracker = true;
    if (marker) {
      map.setView(marker.getLatLng(), 16, { animate: true });
    }
  }

  // Basculer la visibilite du trajet
  function toggleTrail() {
    trailVisible = !trailVisible;
    if (trailVisible) {
      trailBorder.addTo(map);
      trail.addTo(map);
    } else {
      map.removeLayer(trailBorder);
      map.removeLayer(trail);
    }
    return trailVisible;
  }

  // Effacer le marqueur et le trajet
  function clear() {
    trailBorder.setLatLngs([]);
    trail.setLatLngs([]);
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
  }

  // Recalculer la taille de la carte (utile apres redimensionnement)
  function invalidateSize() {
    if (map) {
      setTimeout(function () { map.invalidateSize(); }, 100);
    }
  }

  function getMap() {
    return map;
  }

  return {
    init: init,
    updatePosition: updatePosition,
    centerOnMarker: centerOnMarker,
    toggleTrail: toggleTrail,
    clear: clear,
    invalidateSize: invalidateSize,
    getMap: getMap
  };

})();

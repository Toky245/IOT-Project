// Module de gestion du geofencing (zones polygonales)

var Geofence = (function () {

  var zones = [];
  var polygons = [];
  var drawingMode = false;
  var map = null;
  var onBreachCallback = null;

  // Etat du dessin en cours
  var drawPoints = [];
  var drawMarkers = [];
  var drawLine = null;

  function init(leafletMap) {
    map = leafletMap;
    loadZones();
  }

  // Activer/desactiver le mode dessin
  function toggleDrawing() {
    if (drawingMode) {
      cancelDrawing();
      return false;
    }

    drawingMode = true;
    drawPoints = [];
    drawMarkers = [];
    map.getContainer().style.cursor = 'crosshair';
    map.on('click', onMapClick);
    map.on('dblclick', onMapDblClick);
    Toast.info('Geofencing', 'Cliquez sur la carte pour placer les points. Double-clic pour terminer.');
    return true;
  }

  // Clic simple : ajouter un point
  function onMapClick(e) {
    if (!drawingMode) return;

    var latlng = e.latlng;
    drawPoints.push([latlng.lat, latlng.lng]);

    // Marqueur draggable pour ce point
    var marker = L.circleMarker(latlng, {
      radius: 6,
      color: '#f85149',
      fillColor: '#f85149',
      fillOpacity: 1,
      weight: 2
    }).addTo(map);

    drawMarkers.push(marker);
    updateDrawPreview();
  }

  // Double-clic : terminer le dessin
  function onMapDblClick(e) {
    if (!drawingMode) return;

    // Empecher le zoom du double-clic
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);

    if (drawPoints.length < 3) {
      Toast.warning('Geofencing', 'Il faut au minimum 3 points pour creer une zone.');
      return;
    }

    // Creer la zone avec les points actuels
    var zonePoints = drawPoints.slice();
    finishDrawing();
    addZone(zonePoints);
  }

  // Mise a jour de la ligne de previsualisation
  function updateDrawPreview() {
    if (drawLine) {
      map.removeLayer(drawLine);
    }

    if (drawPoints.length >= 2) {
      // Fermer le polygone pour la preview
      var preview = drawPoints.slice();
      preview.push(preview[0]);
      drawLine = L.polyline(preview, {
        color: '#f85149',
        weight: 2,
        dashArray: '6, 4',
        opacity: 0.7
      }).addTo(map);
    }
  }

  // Annuler le dessin en cours
  function cancelDrawing() {
    drawingMode = false;
    map.getContainer().style.cursor = '';
    map.off('click', onMapClick);
    map.off('dblclick', onMapDblClick);

    // Nettoyer les marqueurs et la ligne de preview
    drawMarkers.forEach(function (m) { map.removeLayer(m); });
    drawMarkers = [];
    drawPoints = [];
    if (drawLine) {
      map.removeLayer(drawLine);
      drawLine = null;
    }
  }

  // Terminer le dessin proprement
  function finishDrawing() {
    drawingMode = false;
    map.getContainer().style.cursor = '';
    map.off('click', onMapClick);
    map.off('dblclick', onMapDblClick);

    drawMarkers.forEach(function (m) { map.removeLayer(m); });
    drawMarkers = [];
    drawPoints = [];
    if (drawLine) {
      map.removeLayer(drawLine);
      drawLine = null;
    }

    // Desactiver le bouton actif
    var btn = document.getElementById('btn-geofence');
    if (btn) btn.classList.remove('map-btn-active');
  }

  // Ajouter une zone polygonale
  function addZone(points) {
    var id = Date.now();

    // Creer les marqueurs draggables aux sommets
    var vertexMarkers = [];
    var polygon = L.polygon(points, {
      color: '#f85149',
      fillColor: '#f85149',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '6, 4'
    }).addTo(map);

    points.forEach(function (pt, idx) {
      var vm = L.circleMarker(pt, {
        radius: 5,
        color: '#fff',
        fillColor: '#f85149',
        fillOpacity: 1,
        weight: 2,
        className: 'geofence-vertex'
      }).addTo(map);

      // Rendre le sommet draggable manuellement
      makeDraggable(vm, id, idx);
      vertexMarkers.push(vm);
    });

    // Popup de suppression
    polygon.bindPopup(
      '<div style="text-align:center;font-family:Inter,sans-serif">' +
      '<b style="font-size:13px">Zone de securite</b><br>' +
      '<span style="font-size:12px;color:#8b949e">' + points.length + ' points</span><br>' +
      '<button onclick="Geofence.removeZone(' + id + ')" ' +
      'style="margin-top:8px;padding:6px 14px;background:#f85149;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600">' +
      'Supprimer</button></div>'
    );

    var zone = { id: id, points: points };
    zones.push(zone);
    polygons.push({ id: id, polygon: polygon, markers: vertexMarkers });

    saveZones();
    updateCounter();
    Toast.success('Geofencing', 'Zone creee avec ' + points.length + ' points');
    return zone;
  }

  // Rendre un marqueur de sommet draggable
  function makeDraggable(marker, zoneId, pointIndex) {
    var dragging = false;

    marker.on('mousedown', function (e) {
      dragging = true;
      map.dragging.disable();
      L.DomEvent.stopPropagation(e);

      function onMove(moveEvt) {
        if (!dragging) return;
        marker.setLatLng(moveEvt.latlng);
        updatePolygonVertex(zoneId, pointIndex, moveEvt.latlng);
      }

      function onUp() {
        dragging = false;
        map.dragging.enable();
        map.off('mousemove', onMove);
        map.off('mouseup', onUp);

        // Sauvegarder la nouvelle position
        var latlng = marker.getLatLng();
        var zone = zones.find(function (z) { return z.id === zoneId; });
        if (zone) {
          zone.points[pointIndex] = [latlng.lat, latlng.lng];
          saveZones();
        }
      }

      map.on('mousemove', onMove);
      map.on('mouseup', onUp);
    });

    // Curseur de deplacement au survol
    marker.on('mouseover', function () {
      map.getContainer().style.cursor = 'grab';
    });
    marker.on('mouseout', function () {
      if (!drawingMode) map.getContainer().style.cursor = '';
    });
  }

  // Mettre a jour un sommet du polygone
  function updatePolygonVertex(zoneId, pointIndex, latlng) {
    var entry = polygons.find(function (p) { return p.id === zoneId; });
    if (!entry) return;

    var latlngs = entry.polygon.getLatLngs()[0];
    latlngs[pointIndex] = latlng;
    entry.polygon.setLatLngs(latlngs);
  }

  // Supprimer une zone
  function removeZone(id) {
    var idx = polygons.findIndex(function (p) { return p.id === id; });
    if (idx !== -1) {
      map.removeLayer(polygons[idx].polygon);
      polygons[idx].markers.forEach(function (m) { map.removeLayer(m); });
      polygons.splice(idx, 1);
    }

    zones = zones.filter(function (z) { return z.id !== id; });
    saveZones();
    updateCounter();
  }

  // Supprimer toutes les zones
  function clearAll() {
    polygons.forEach(function (p) {
      map.removeLayer(p.polygon);
      p.markers.forEach(function (m) { map.removeLayer(m); });
    });
    polygons = [];
    zones = [];
    saveZones();
    updateCounter();
  }

  // Verifier si une position est dans les zones (point-in-polygon)
  function checkPosition(lat, lng) {
    var breaches = [];

    zones.forEach(function (zone) {
      if (!pointInPolygon(lat, lng, zone.points)) {
        breaches.push(zone);
      }
    });

    if (breaches.length > 0 && onBreachCallback) {
      onBreachCallback(breaches, lat, lng);
    }

    return breaches;
  }

  // Algorithme ray-casting pour point-in-polygon
  function pointInPolygon(lat, lng, points) {
    var inside = false;
    var n = points.length;

    for (var i = 0, j = n - 1; i < n; j = i++) {
      var yi = points[i][0], xi = points[i][1];
      var yj = points[j][0], xj = points[j][1];

      if (((yi > lat) !== (yj > lat)) &&
          (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  function saveZones() {
    localStorage.setItem('geofence_zones', JSON.stringify(zones));
  }

  function loadZones() {
    var saved = localStorage.getItem('geofence_zones');
    if (saved) {
      var parsed = JSON.parse(saved);
      parsed.forEach(function (z) {
        if (z.points) {
          addZone(z.points);
        }
      });
    }
  }

  function updateCounter() {
    var el = document.getElementById('geofence-count');
    if (el) el.textContent = zones.length;
  }

  function onBreach(cb) {
    onBreachCallback = cb;
  }

  function getZoneCount() {
    return zones.length;
  }

  return {
    init: init,
    toggleDrawing: toggleDrawing,
    addZone: addZone,
    removeZone: removeZone,
    clearAll: clearAll,
    checkPosition: checkPosition,
    onBreach: onBreach,
    getZoneCount: getZoneCount
  };

})();

// Module de reverse geocoding via le proxy backend

var Geocoder = (function () {

  var cache = {};
  var debounceTimer = null;
  var DEBOUNCE_MS = 2000;

  // Arrondir les coordonnees pour le cache (precision ~10m)
  function cacheKey(lat, lng) {
    return parseFloat(lat).toFixed(4) + ',' + parseFloat(lng).toFixed(4);
  }

  // Reverse geocoding avec debounce et cache
  function reverseGeocode(lat, lng, callback) {
    var key = cacheKey(lat, lng);

    if (cache[key]) {
      callback(cache[key]);
      return;
    }

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(function () {
      fetch('/api/geocode?lat=' + lat + '&lon=' + lng)
        .then(function (res) {
          if (!res.ok) return null;
          return res.json();
        })
        .then(function (data) {
          if (!data || data.error) {
            callback(null);
            return;
          }
          var address = formatAddress(data);
          cache[key] = address;
          callback(address);
        })
        .catch(function () {
          callback(null);
        });
    }, DEBOUNCE_MS);
  }

  // Formater l'adresse en texte lisible
  function formatAddress(data) {
    if (!data) return null;

    if (!data.address) return data.display_name || null;

    var a = data.address;
    var parts = [];

    if (a.road || a.pedestrian || a.footway) {
      parts.push(a.road || a.pedestrian || a.footway);
    }
    if (a.neighbourhood || a.suburb || a.quarter) {
      parts.push(a.neighbourhood || a.suburb || a.quarter);
    }
    if (a.city || a.town || a.village || a.municipality) {
      parts.push(a.city || a.town || a.village || a.municipality);
    }

    return parts.length > 0 ? parts.join(', ') : (data.display_name || null);
  }

  return {
    reverseGeocode: reverseGeocode
  };

})();

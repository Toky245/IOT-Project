// Fonctions utilitaires reutilisables

var Utils = (function () {

  // Calcul de distance entre deux coordonnees GPS (formule de Haversine)
  function haversineDistance(lat1, lng1, lat2, lng2) {
    var R = 6371000;
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function toRad(deg) {
    return deg * Math.PI / 180;
  }

  // Formater la distance pour l'affichage
  function formatDistance(meters) {
    if (meters >= 1000) {
      return (meters / 1000).toFixed(2) + ' km';
    }
    return meters.toFixed(0) + ' m';
  }

  // Formater un timestamp ISO en heure locale
  function formatTime(isoString) {
    return new Date(isoString).toLocaleTimeString('fr-FR');
  }

  return {
    haversineDistance: haversineDistance,
    formatDistance: formatDistance,
    formatTime: formatTime
  };

})();

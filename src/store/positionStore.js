// Stockage en memoire des positions GPS

class PositionStore {
  constructor() {
    this.positions = [];
  }

  add(data) {
    const position = {
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng),
      speed: parseFloat(data.speed) || 0,
      altitude: parseFloat(data.altitude) || 0,
      timestamp: new Date().toISOString()
    };
    this.positions.push(position);
    return position;
  }

  getAll() {
    return this.positions;
  }

  clear() {
    this.positions = [];
  }

  count() {
    return this.positions.length;
  }
}

module.exports = new PositionStore();

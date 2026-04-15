# GPS Tracker IOT

Application de suivi GPS en temps reel pour un projet scolaire IOT.

Un module GPS (NEO-6M) connecte a un microcontroleur ESP32 envoie les coordonnees par WiFi vers un serveur web. Les positions s'affichent en direct sur une carte interactive avec historique, zones de securite et alertes Telegram.

## Fonctionnalites

- Carte interactive avec 4 couches (Standard, Satellite, Topographique, Sombre)
- Geofencing : definir des zones de securite et recevoir une alerte si le tracker en sort
- Notifications Telegram en temps reel
- Export des donnees GPS en CSV et JSON
- Historique complet des positions
- Theme clair et sombre
- Tutoriel interactif integre
- Documentation API Swagger

## Materiel

- ESP32
- GPS NEO-6M
- Breadboard
- 4 cables (VCC, GND, TX, RX)
- Cable USB (Micro-USB)

## Installation

```bash
npm install
```

## Lancement

```bash
npm start
```

Ouvrir http://localhost:4900

## Simuler des positions GPS (sans materiel)

```bash
npm run simulate
```

## Documentation API

Accessible sur http://localhost:4900/api/docs

## Cablage ESP32 + GPS NEO-6M

| GPS NEO-6M | ESP32   |
|------------|---------|
| VCC        | 3.3V    |
| GND        | GND     |
| TX         | GPIO 16 |
| RX         | GPIO 17 |

## Upload du code ESP32

1. Ouvrir le dossier `esp32/` dans VS Code avec PlatformIO
2. Modifier le WiFi et l'IP du serveur dans `src/main.cpp`
3. Brancher l'ESP32 en USB
4. Cliquer sur Upload

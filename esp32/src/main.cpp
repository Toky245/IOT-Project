// ESP32 + GPS NEO-6M - Envoi des donnees GPS au serveur

#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>

// -- Configuration WiFi --
const char* WIFI_SSID = "Redmi 10X Pro";
const char* WIFI_PASSWORD = "howUd@r3";

// -- Configuration serveur --
const char* SERVER_URL = "http://192.168.215.60:4900/api/position";

// -- Configuration GPS --
// Pins de connexion GPS NEO-6M -> ESP32
#define GPS_RX 16  // GPIO16 -> TX du GPS
#define GPS_TX 17  // GPIO17 -> RX du GPS
#define GPS_BAUD 9600

// Intervalle d'envoi en millisecondes
#define SEND_INTERVAL 2000

TinyGPSPlus gps;
HardwareSerial gpsSerial(1);

unsigned long lastSendTime = 0;
bool wifiConnected = false;

// Prototypes
void connectWiFi();
void sendPosition();

void setup() {
  Serial.begin(115200);
  Serial.println("[GPS Tracker] Demarrage...");

  // Initialiser le port serie du GPS
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial.println("[GPS] Module GPS initialise (RX:" + String(GPS_RX) + " TX:" + String(GPS_TX) + ")");

  // Connexion WiFi
  connectWiFi();
}

void loop() {
  // Lire les donnees GPS
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Verifier la connexion WiFi
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    connectWiFi();
  }

  // Envoyer les donnees a intervalle regulier
  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;

    if (gps.location.isValid()) {
      sendPosition();
    } else {
      Serial.println("[GPS] En attente de signal GPS... (Satellites: " + String(gps.satellites.value()) + ")");
    }
  }
}

// Connexion au reseau WiFi
void connectWiFi() {
  Serial.print("[WiFi] Connexion a " + String(WIFI_SSID));
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n[WiFi] Connecte - IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[WiFi] Echec de connexion. Nouvelle tentative dans 5s...");
    delay(5000);
  }
}

// Envoyer la position GPS au serveur
void sendPosition() {
  if (!wifiConnected) return;

  double lat = gps.location.lat();
  double lng = gps.location.lng();
  double speed = gps.speed.kmph();
  double altitude = gps.altitude.meters();

  // Construire le JSON
  String json = "{";
  json += "\"lat\":" + String(lat, 6) + ",";
  json += "\"lng\":" + String(lng, 6) + ",";
  json += "\"speed\":" + String(speed, 1) + ",";
  json += "\"altitude\":" + String(altitude, 1);
  json += "}";

  Serial.println("[GPS] Position: " + String(lat, 6) + ", " + String(lng, 6) +
                 " | Vitesse: " + String(speed, 1) + " km/h" +
                 " | Alt: " + String(altitude, 1) + " m" +
                 " | Sat: " + String(gps.satellites.value()));

  // Envoi HTTP POST
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(json);

  if (httpCode == 200 || httpCode == 201) {
    Serial.println("[HTTP] Envoye OK");
  } else {
    Serial.println("[HTTP] Erreur: " + String(httpCode));
  }

  http.end();
}

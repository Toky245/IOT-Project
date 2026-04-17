// Point d'entree du serveur GPS Tracker

require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const config = require('./config');
const WebSocketService = require('./services/websocket');
const TelegramService = require('./services/telegram');
const { router: positionRouter, setWebSocketService } = require('./routes/position');
const exportRouter = require('./routes/export');
const { router: telegramRouter, setTelegramService } = require('./routes/telegram');
const geocodeRouter = require('./routes/geocode');

const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Documentation API
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GPS Tracker - API Documentation'
}));

// Routes API
app.use('/api/position', positionRouter);
app.use('/api/positions', positionRouter);
app.use('/api/export', exportRouter);
app.use('/api/telegram', telegramRouter);
app.use('/api/geocode', geocodeRouter);

// Services
const wsService = new WebSocketService(server);
setWebSocketService(wsService);

const telegramService = new TelegramService();
setTelegramService(telegramService);

// Demarrage
server.listen(config.port, () => {
  console.log('Serveur GPS Tracker demarre sur le port ' + config.port);
  console.log('Interface : http://localhost:' + config.port);
  console.log('API       : http://localhost:' + config.port + '/api/position');
  console.log('Swagger   : http://localhost:' + config.port + '/api/docs');
});

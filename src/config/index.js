// Configuration globale du serveur

const config = {
  port: process.env.PORT || 4900,
  defaultCenter: {
    lat: -18.9100,
    lng: 47.5255
  },
  telegram: {
    token: process.env.TELEGRAM_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || ''
  }
};

module.exports = config;

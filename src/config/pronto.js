const axios = require('axios');

// Configuration de l'API Pronto
const PRONTO_API_KEY = process.env.PRONTO_API_KEY || 'b4-tQyxNcSR2SX6_oYE3ZGTTeZRwBgT1kpGiMgusfzqYcQnXzw';
const PRONTO_BASE_URL = 'https://app.prontohq.com/api/v2';

// Instance axios configurée pour Pronto
const prontoClient = axios.create({
  baseURL: PRONTO_BASE_URL,
  headers: {
    'X-API-KEY': PRONTO_API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 secondes de timeout
});

// Intercepteur pour logger les requêtes (optionnel)
prontoClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 Pronto API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Pronto API Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour logger les réponses (optionnel)
prontoClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Pronto API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Pronto API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

module.exports = {
  prontoClient,
  PRONTO_API_KEY,
  PRONTO_BASE_URL
}; 
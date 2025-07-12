require('dotenv').config();
const axios = require('axios');

const prontoClient = axios.create({
  baseURL: 'https://app.prontohq.com/api/v2',
  headers: {
    'X-API-KEY': process.env.PRONTO_API_KEY,
    'Content-Type': 'application/json'
  }
});

module.exports = { prontoClient }; 
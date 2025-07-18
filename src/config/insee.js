const axios = require('axios');

// Identifiants INSEE fournis (à déplacer dans .env pour la prod)
const INSEE_CLIENT_ID = '2bDDNrGabFzqXw54kuw2hfiJCE4a';
const INSEE_CLIENT_SECRET = 'ic29yAaQPoBdyRhlONu0BhS8JHQa';
let INSEE_ACCESS_TOKEN = '7ae10992-13f0-311e-88b8-7cacccd4bbf8'; // Jeton fourni, mais on prévoit le refresh

// Fonction pour rafraîchir le token si besoin
async function refreshInseeToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  try {
    const res = await axios.post('https://api.insee.fr/token', params, {
      auth: { username: INSEE_CLIENT_ID, password: INSEE_CLIENT_SECRET },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    INSEE_ACCESS_TOKEN = res.data.access_token;
    return INSEE_ACCESS_TOKEN;
  } catch (error) {
    throw new Error('Erreur lors du refresh du token INSEE: ' + (error.response?.data || error.message));
  }
}

// Fonction générique pour requêter l'API SIRENE
async function inseeRequest(path, params = {}) {
  try {
    const res = await axios.get(`https://api.insee.fr/entreprises/sirene/V3${path}`, {
      headers: { Authorization: `Bearer ${INSEE_ACCESS_TOKEN}` },
      params
    });
    return res.data;
  } catch (error) {
    // Si 401, on tente un refresh du token puis on refait la requête
    if (error.response && error.response.status === 401) {
      await refreshInseeToken();
      const res = await axios.get(`https://api.insee.fr/entreprises/sirene/V3${path}`, {
        headers: { Authorization: `Bearer ${INSEE_ACCESS_TOKEN}` },
        params
      });
      return res.data;
    }
    throw error;
  }
}

module.exports = { inseeRequest, refreshInseeToken }; 
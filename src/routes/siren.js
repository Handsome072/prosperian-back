const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /siren?q=denominationUniteLegale
router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Le paramètre q (denominationUniteLegale) est requis.' });
  }

  try {
    // Utiliser le jeton d'accès INSEE depuis le .env
    const accessToken = process.env.INSEE_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({ error: 'Le jeton d\'accès INSEE n\'est pas configuré.' });
    }

    // Appel à l'API SIRENE
    const apiResponse = await axios.get('https://api.insee.fr/entreprises/sirene/V3.11/siren', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        q: `denominationUniteLegale:${q}`,
        nombre: 1
      }
    });

    res.json(apiResponse.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router; 
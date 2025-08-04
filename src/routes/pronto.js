const express = require('express');
const router = express.Router();
const { prontoClient } = require('../config/pronto');

router.get('/personas', async (req, res) => {
  try {
    const response = await prontoClient.get('/personas');
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.get('/personas/:id', async (req, res) => {
  try {
    const response = await prontoClient.get(`/personas/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.get('/lists', async (req, res) => {
  try {
    const response = await prontoClient.get('/lists');
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.get('/lists/:id', async (req, res) => {
  try {
    const response = await prontoClient.get(`/lists/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/lists', async (req, res) => {
  try {
    const response = await prontoClient.post('/lists', req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.put('/lists/:id', async (req, res) => {
  try {
    const response = await prontoClient.put(`/lists/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.get('/searches', async (req, res) => {
  try {
    const response = await prontoClient.get('/searches');
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.get('/searches/:id', async (req, res) => {
  try {
    const response = await prontoClient.get(`/searches/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.get('/searches/:id/leads', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 100 } = req.query;
    
    console.log(`🔍 Backend: Tentative de chargement des leads pour search_id: ${id}, page: ${page}, limit: ${limit}`);
    
    const response = await prontoClient.post('/leads/extract', {
      search_id: id,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    console.log(`✅ Backend: Succès pour ${id}, ${response.data.leads?.length || 0} entreprises`);
    
    // Debug: Afficher la structure des données pour la première entreprise
    if (response.data.leads && response.data.leads.length > 0) {
      const firstLead = response.data.leads[0];
      console.log('🔍 Backend - Structure des données de la première entreprise:', {
        company: firstLead.company,
        lead: firstLead.lead,
        companyProfilePicture: firstLead.company?.company_profile_picture,
        leadProfileImage: firstLead.lead?.profile_image_url
      });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Backend: Erreur pour ${req.params.id}:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const response = await prontoClient.post('/leads', req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/accounts/profiles', async (req, res) => {
  try {
    const response = await prontoClient.post('/accounts/profiles', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/accounts/headcount', async (req, res) => {
  try {
    const response = await prontoClient.post('/accounts/headcount', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/accounts/extract', async (req, res) => {
  try {
    const response = await prontoClient.post('/accounts/extract', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/leads/extract', async (req, res) => {
  try {
    const response = await prontoClient.post('/leads/extract', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/leads/company', async (req, res) => {
  try {
    const response = await prontoClient.post('/leads/company', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/enrichments/account', async (req, res) => {
  try {
    const response = await prontoClient.post('/enrichments/account', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/enrichments/lead', async (req, res) => {
  try {
    const response = await prontoClient.post('/enrichments/lead', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/enrichments/contact', async (req, res) => {
  try {
    const response = await prontoClient.post('/enrichments/contact', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/enrichments/contacts/bulk', async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.post(
      'https://app.prontohq.com/api/v2/contacts/bulk_enrich',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'b4-tQyxNcSR2SX6_oYE3ZGTTeZRwBgT1kpGiMgusfzqYcQnXzw'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/intent/hiring', async (req, res) => {
  try {
    const response = await prontoClient.post('/intent/hiring', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/intent/growing', async (req, res) => {
  try {
    const response = await prontoClient.post('/intent/growing', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/intent/lookalikes', async (req, res) => {
  try {
    const response = await prontoClient.post('/intent/lookalikes', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/intent/new-hires', async (req, res) => {
  try {
    const response = await prontoClient.post('/intent/new-hires', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/intent/job-changes', async (req, res) => {
  try {
    const response = await prontoClient.post('/intent/job-changes', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.get('/credits', async (req, res) => {
  try {
    const response = await prontoClient.get('/credits');
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.get('/account', async (req, res) => {
  try {
    const response = await prontoClient.get('/account');
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

router.post('/accounts/single_enrich', async (req, res) => {
  try {
    const response = await prontoClient.post('/accounts/single_enrich', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// GET /api/pronto/companies/enrich
router.get('/companies/enrich', async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({
        error: 'Le paramètre "name" est requis'
      });
    }

    console.log(`🔍 Enrichissement de l'entreprise: ${name}`);
    console.log(`🔗 URL appelée: ${prontoClient.defaults.baseURL}/companies/enrich?name=${encodeURIComponent(name)}`);
    
    let response;
    
    // Utiliser directement l'endpoint /accounts/single_enrich qui existe dans l'API v2
    try {
      response = await prontoClient.post('/accounts/single_enrich', {
        name: name
      });
      console.log('✅ Succès avec /accounts/single_enrich');
    } catch (error) {
      console.error('❌ Erreur avec /accounts/single_enrich');
      throw error;
    }

    console.log('✅ Résultat enrichi :');
    console.log(JSON.stringify(response.data, null, 2));

    // Analyser si l'entreprise a été trouvée
    const isFound = response.data && (
      response.data.name || 
      response.data.website || 
      response.data.description ||
      response.data.industry ||
      response.data.headquarters
    );

    // Ajouter le champ found à la réponse
    const enrichedResponse = {
      found: !!isFound,
      ...response.data
    };

    console.log(`🔍 Entreprise trouvée: ${enrichedResponse.found}`);

    res.json(enrichedResponse);
  } catch (error) {
    console.error('❌ Erreur lors de l\'enrichissement:', error.message);
    
    if (error.response) {
      console.error('Erreur ProntoHQ:', error.response.data);
      res.status(error.response.status).json({
        error: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'Erreur lors de la requête à ProntoHQ',
        message: error.message
      });
    }
  }
});

module.exports = router; 

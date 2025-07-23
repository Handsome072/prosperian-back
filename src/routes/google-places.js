const express = require('express');
const router = express.Router();
const axios = require('axios');

// Configuration Apify
const APIFY_BASE_URL = 'https://api.apify.com/v2';
const APIFY_ACTOR_ID = 'compass/crawler-google-places'; // Format original avec /
const APIFY_TOKEN = 'apify_api_JzzNKSwZReD5T2PO3hNVcJas1ZcjVp01zVOo';

/**
 * @swagger
 * /api/google-places/search-enseigne:
 *   post:
 *     summary: Recherche d'entreprises par enseigne/franchise via Apify
 *     description: Recherche d'entreprises sur Google Maps par nom d'enseigne ou franchise
 *     tags:
 *       - Google Places
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enseigne:
 *                 type: string
 *                 description: Nom de l'enseigne ou franchise
 *                 example: "Carrefour"
 *               location:
 *                 type: string
 *                 description: Localisation de recherche
 *                 example: "France"
 *               maxResults:
 *                 type: integer
 *                 description: Nombre maximum de résultats
 *                 example: 50
 *             required:
 *               - enseigne
 *     responses:
 *       200:
 *         description: Résultats de la recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                 totalResults:
 *                   type: integer
 *                 searchQuery:
 *                   type: string
 */
router.post('/search-enseigne', async (req, res) => {
  try {
    const { enseigne, location = 'France', maxResults = 50 } = req.body;

    if (!enseigne) {
      return res.status(400).json({
        success: false,
        error: 'Le paramètre "enseigne" est requis'
      });
    }

    console.log(`🔍 Recherche Apify côté serveur pour enseigne: "${enseigne}" dans "${location}"`);
    console.log(`🔑 Token utilisé: ${APIFY_TOKEN.substring(0, 20)}...`);

    // Configuration de la recherche Apify - Version simplifiée pour éviter les erreurs
    const searchInput = {
      searchStringsArray: [`${enseigne}`], // Recherche plus simple
      locationQuery: location,
      maxCrawledPlacesPerSearch: Math.min(maxResults, 20), // Limiter à 20 pour éviter les timeouts
      includeReviews: false,
      includeImages: false, // Désactiver pour réduire la charge
      includeOpeningHours: false, // Désactiver pour réduire la charge
      includePeopleAlsoSearch: false,
      maxReviews: 0,
      language: 'fr',
      exportPlaceUrls: false,
      additionalInfo: false, // Désactiver pour réduire la charge
      onlyDataFromSearchPage: true // Activer pour accélérer
    };

    // Encoder l'actor ID pour l'URL
    const encodedActorId = encodeURIComponent(APIFY_ACTOR_ID);
    const apiUrl = `${APIFY_BASE_URL}/acts/${encodedActorId}/runs`;
    console.log(`🌐 URL API complète: ${apiUrl}`);
    console.log(`📋 Actor ID encodé: ${encodedActorId}`);
    console.log(`📋 Configuration envoyée:`, JSON.stringify(searchInput, null, 2));

    // Appel à l'API Apify pour démarrer le run
    const runResponse = await axios.post(apiUrl, searchInput, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_TOKEN}`
      },
      timeout: 15000 // Augmenter le timeout
    });

    console.log(`📡 Réponse API Status: ${runResponse.status}`);
    console.log(`📡 Run créé avec ID: ${runResponse.data.data.id}`);
    const runId = runResponse.data.data.id;

    // Attendre que le run se termine (avec timeout réduit)
    const results = await waitForRunCompletion(runId, 60000); // 1 minute max au lieu de 2

    // Transformer les résultats
    const transformedResults = results.map(item => ({
      title: item.title || item.name || '',
      address: item.address || '',
      phone: item.phoneNumber || item.phone || '',
      website: item.website || item.url || '',
      category: item.categoryName || item.category || '',
      rating: item.totalScore || item.rating || 0,
      reviewsCount: item.reviewsCount || 0,
      latitude: item.location?.lat || item.latitude,
      longitude: item.location?.lng || item.longitude,
      placeId: item.placeId || item.id || '',
      isAdvertisement: item.isAdvertisement || false,
      description: item.description || '',
      imageUrls: item.imageUrls || []
    }));

    console.log(`✅ ${transformedResults.length} résultats trouvés pour "${enseigne}"`);

    res.json({
      success: true,
      results: transformedResults,
      totalResults: transformedResults.length,
      searchQuery: `${enseigne} ${location}`,
      source: 'apify_real_api'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la recherche Apify:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

/**
 * @swagger
 * /api/google-places/check-quota:
 *   get:
 *     summary: Vérifier le quota et les informations du compte Apify
 *     description: Vérifie les limites et l'utilisation du compte Apify
 *     tags:
 *       - Google Places
 *     responses:
 *       200:
 *         description: Informations sur le compte
 */
router.get('/check-quota', async (req, res) => {
  try {
    console.log('🔍 Vérification du quota Apify...');
    
    // Vérifier les informations du compte
    const userResponse = await axios.get(`${APIFY_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${APIFY_TOKEN}`
      }
    });

    const userData = userResponse.data.data;
    console.log('👤 Informations utilisateur:', {
      id: userData.id,
      username: userData.username,
      plan: userData.plan
    });

    // Vérifier l'utilisation des ressources
    const usageResponse = await axios.get(`${APIFY_BASE_URL}/users/me/usage/monthly`, {
      headers: {
        'Authorization': `Bearer ${APIFY_TOKEN}`
      }
    });

    const usageData = usageResponse.data.data;
    console.log('📊 Utilisation mensuelle:', usageData);

    res.json({
      success: true,
      user: {
        id: userData.id,
        username: userData.username,
        plan: userData.plan
      },
      usage: usageData,
      recommendations: [
        userData.plan === 'FREE' ? 'Plan gratuit - limites plus restrictives' : 'Plan payant',
        `Utilisé ${usageData.computeUnits || 0} unités de calcul ce mois`,
        'Vérifiez que le token a les bonnes permissions'
      ]
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du quota:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du quota',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// Fonction pour attendre la fin du run Apify
async function waitForRunCompletion(runId, maxWaitTime = 60000) {
  const startTime = Date.now();
  const pollInterval = 2000; // 2 secondes - plus fréquent

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const statusResponse = await axios.get(`${APIFY_BASE_URL}/actor-runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${APIFY_TOKEN}`
        }
      });

      const runData = statusResponse.data.data;
      const status = runData.status;
      console.log(`📊 Statut du run: ${status} (${Math.round((Date.now() - startTime) / 1000)}s)`);
      
      // Log des statistiques du run
      if (runData.stats) {
        console.log(`📈 Stats run: ${JSON.stringify(runData.stats)}`);
      }

      if (status === 'SUCCEEDED') {
        // Récupérer les résultats
        const resultsResponse = await axios.get(`${APIFY_BASE_URL}/actor-runs/${runId}/dataset/items`, {
          headers: {
            'Authorization': `Bearer ${APIFY_TOKEN}`
          }
        });

        console.log(`✅ Run terminé avec ${resultsResponse.data.length} résultats`);
        return resultsResponse.data;
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        // Obtenir plus d'informations sur l'erreur
        console.error(`❌ Détails du run aborté:`, {
          status: status,
          startedAt: runData.startedAt,
          finishedAt: runData.finishedAt,
          stats: runData.stats,
          buildNumber: runData.buildNumber,
          exitCode: runData.exitCode,
          containerUrl: runData.containerUrl
        });
        
        // Essayer de récupérer les logs d'erreur
        try {
          const logsResponse = await axios.get(`${APIFY_BASE_URL}/actor-runs/${runId}/log`, {
            headers: {
              'Authorization': `Bearer ${APIFY_TOKEN}`
            }
          });
          console.error(`📝 Logs du run:`, logsResponse.data.substring(0, 1000)); // Premiers 1000 caractères
        } catch (logError) {
          console.warn(`⚠️ Impossible de récupérer les logs: ${logError.message}`);
        }
        
        throw new Error(`Le run Apify a échoué avec le statut: ${status}. Vérifiez les logs ci-dessus pour plus de détails.`);
      }

      // Attendre avant le prochain poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Erreur lors de l\'attente du run:', error);
      throw error;
    }
  }

  throw new Error('Timeout: Le run Apify a pris trop de temps à se terminer');
}

module.exports = router; 
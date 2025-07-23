const express = require('express');
const router = express.Router();
const { analyzeSemanticSearch, getSemanticSuggestions, getPopularConcepts, analyzeSearchIntent } = require('../config/semantic');

/**
 * Route pour analyser un terme de recherche sémantique et retourner les codes NAF
 * GET /api/semantic/analyze?term=services de beauté
 */
router.get('/analyze', async (req, res) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        error: 'Le paramètre "term" est requis',
        message: 'Veuillez spécifier un terme à analyser (ex: services de beauté, restauration)',
        example: '/api/semantic/analyze?term=services de beauté'
      });
    }

    console.log('🔍 Analyse sémantique pour:', term);

    // Analyser le terme de recherche
    const analysis = analyzeSearchIntent(term);

    console.log(`✅ Analyse terminée: ${analysis.codesCount} codes NAF trouvés (confiance: ${analysis.confidence})`);

    res.json({
      success: true,
      query: {
        term: term
      },
      analysis: analysis,
      metadata: {
        source: 'semantic_analysis',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - Date.now() // Instantané
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse sémantique:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'analyse sémantique',
      message: error.message
    });
  }
});

/**
 * Route pour obtenir des suggestions d'auto-complétion sémantique
 * GET /api/semantic/suggestions?term=rest
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { term, limit = 10 } = req.query;

    if (!term) {
      return res.status(400).json({
        error: 'Le paramètre "term" est requis',
        message: 'Veuillez spécifier un terme partiel pour les suggestions',
        example: '/api/semantic/suggestions?term=rest'
      });
    }

    console.log('💡 Suggestions sémantiques pour:', term);

    // Obtenir les suggestions
    const suggestions = getSemanticSuggestions(term).slice(0, parseInt(limit));

    console.log(`✅ ${suggestions.length} suggestions trouvées`);

    res.json({
      success: true,
      query: {
        term: term,
        limit: parseInt(limit)
      },
      total_suggestions: suggestions.length,
      suggestions: suggestions,
      metadata: {
        source: 'semantic_suggestions',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des suggestions',
      message: error.message
    });
  }
});

/**
 * Route pour obtenir les concepts populaires
 * GET /api/semantic/popular
 */
router.get('/popular', async (req, res) => {
  try {
    console.log('📋 Récupération des concepts populaires');

    const popularConcepts = getPopularConcepts();

    res.json({
      success: true,
      total_concepts: popularConcepts.length,
      concepts: popularConcepts,
      metadata: {
        source: 'popular_concepts',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des concepts populaires:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des concepts populaires',
      message: error.message
    });
  }
});

/**
 * Route pour rechercher des entreprises via recherche sémantique
 * POST /api/semantic/search
 */
router.post('/search', async (req, res) => {
  try {
    const { 
      term, 
      location = 'France',
      page = 1,
      limit = 50,
      additionalFilters = {}
    } = req.body;

    if (!term) {
      return res.status(400).json({
        error: 'Le paramètre "term" est requis',
        message: 'Veuillez spécifier un terme de recherche sémantique',
        example: {
          term: 'services de beauté',
          location: 'Paris',
          limit: 50
        }
      });
    }

    console.log('🔍 Recherche sémantique pour:', { term, location, limit });

    // 1. Analyser le terme pour obtenir les codes NAF
    const analysis = analyzeSearchIntent(term);
    
    if (analysis.nafCodes.length === 0) {
      return res.json({
        success: true,
        query: { term, location, page, limit },
        total_results: 0,
        results: [],
        analysis: analysis,
        message: 'Aucun code NAF trouvé pour ce terme. Essayez des termes comme "restauration", "services de beauté", etc.',
        metadata: {
          source: 'semantic_search',
          timestamp: new Date().toISOString()
        }
      });
    }

    // 2. Effectuer la recherche avec les codes NAF trouvés
    const API_URL = "http://localhost:4000/api/search?section_activite_principale=A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U";
    let searchUrl = `${API_URL}&page=${page}&per_page=${limit}`;
    
    // Ajouter les codes NAF à la recherche
    if (analysis.nafCodes.length > 0) {
      searchUrl += `&activite_principale=${analysis.nafCodes.join(',')}`;
    }

    console.log('🔗 URL de recherche construite:', searchUrl);

    // 3. Appeler l'API de recherche existante
    const searchResponse = await fetch(searchUrl, {
      headers: { accept: "application/json" }
    });

    if (!searchResponse.ok) {
      throw new Error(`Erreur API de recherche: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    console.log(`✅ ${searchData.results?.length || 0} entreprises trouvées via recherche sémantique`);

    // 4. Enrichir les résultats avec les informations sémantiques
    const enrichedResults = (searchData.results || []).map(result => ({
      ...result,
      semantic_analysis: {
        search_term: term,
        matched_concepts: analysis.relatedConcepts,
        confidence: analysis.confidence
      }
    }));

    res.json({
      success: true,
      query: { term, location, page, limit },
      total_results: searchData.total_results || 0,
      results: enrichedResults,
      analysis: analysis,
      pagination: {
        page: searchData.page || page,
        per_page: searchData.per_page || limit,
        total_pages: searchData.total_pages || 1
      },
      metadata: {
        source: 'semantic_search',
        timestamp: new Date().toISOString(),
        naf_codes_used: analysis.nafCodes
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la recherche sémantique:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche sémantique',
      message: error.message
    });
  }
});

/**
 * Route pour obtenir des exemples de recherche sémantique
 * GET /api/semantic/examples
 */
router.get('/examples', async (req, res) => {
  try {
    const examples = [
      {
        category: 'Restauration',
        examples: ['restauration', 'services de restauration', 'resto', 'manger']
      },
      {
        category: 'Beauté & Bien-être',
        examples: ['services de beauté', 'beauté', 'coiffure', 'bien-être']
      },
      {
        category: 'Santé',
        examples: ['santé', 'médical', 'pharmacie', 'paramédical']
      },
      {
        category: 'Commerce',
        examples: ['commerce', 'magasin', 'boutique', 'vente']
      },
      {
        category: 'Services aux entreprises',
        examples: ['services aux entreprises', 'conseil', 'comptabilité']
      },
      {
        category: 'Bâtiment',
        examples: ['bâtiment', 'construction', 'travaux', 'btp']
      },
      {
        category: 'Automobile',
        examples: ['automobile', 'garage', 'auto', 'voiture']
      },
      {
        category: 'Informatique',
        examples: ['informatique', 'numérique', 'développement', 'it']
      }
    ];

    res.json({
      success: true,
      total_categories: examples.length,
      examples: examples,
      metadata: {
        source: 'semantic_examples',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des exemples:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des exemples',
      message: error.message
    });
  }
});

module.exports = router; 
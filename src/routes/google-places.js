const express = require('express');
const router = express.Router();
const { searchGooglePlaces, normalizeGooglePlacesData } = require('../config/apify');

/**
 * Route pour rechercher des entreprises par activité via Google Places
 * GET /api/google-places/search?activity=restaurant&location=Paris&limit=50
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      activity, 
      location = 'France', 
      limit = 50,
      format = 'normalized' // 'raw' ou 'normalized'
    } = req.query;

    if (!activity) {
      return res.status(400).json({
        error: 'Le paramètre "activity" est requis',
        message: 'Veuillez spécifier une activité à rechercher (ex: restaurant, boulangerie, coiffeur)',
        example: '/api/google-places/search?activity=restaurant&location=Paris&limit=50'
      });
    }

    console.log('🔍 Recherche Google Places:', { activity, location, limit });

    // Rechercher via Google Places
    const rawResults = await searchGooglePlaces(activity, location, parseInt(limit));

    let results;
    if (format === 'normalized') {
      // Normaliser les données pour correspondre au format de l'application
      results = normalizeGooglePlacesData(rawResults);
    } else {
      // Retourner les données brutes
      results = rawResults;
    }

    console.log(`✅ ${results.length} entreprises trouvées pour "${activity}" à ${location}`);

    res.json({
      success: true,
      query: {
        activity,
        location,
        limit: parseInt(limit),
        format
      },
      total_results: results.length,
      results: results,
      metadata: {
        source: 'google_places_apify',
        timestamp: new Date().toISOString(),
        processing_time: null // À implémenter si nécessaire
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la recherche Google Places:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche Google Places',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

/**
 * Route pour rechercher des entreprises avec filtres avancés
 * POST /api/google-places/search-advanced
 */
router.post('/search-advanced', async (req, res) => {
  try {
    const {
      activities = [], // Array d'activités à rechercher
      location = 'France',
      limit = 50,
      filters = {}, // Filtres supplémentaires
      combine_results = true // Combiner les résultats de toutes les activités
    } = req.body;

    if (!activities || activities.length === 0) {
      return res.status(400).json({
        error: 'Le paramètre "activities" est requis',
        message: 'Veuillez spécifier un tableau d\'activités à rechercher',
        example: {
          activities: ['restaurant', 'boulangerie'],
          location: 'Paris',
          limit: 50
        }
      });
    }

    console.log('🔍 Recherche avancée Google Places:', { activities, location, limit });

    const allResults = [];
    const searchResults = [];

    // Rechercher pour chaque activité
    for (const activity of activities) {
      try {
        console.log(`🔍 Recherche pour l'activité: ${activity}`);
        const rawResults = await searchGooglePlaces(activity, location, Math.ceil(limit / activities.length));
        const normalizedResults = normalizeGooglePlacesData(rawResults);

        // Ajouter l'activité recherchée aux métadonnées
        const resultsWithActivity = normalizedResults.map(result => ({
          ...result,
          searched_activity: activity
        }));

        if (combine_results) {
          allResults.push(...resultsWithActivity);
        } else {
          searchResults.push({
            activity,
            results: resultsWithActivity,
            count: resultsWithActivity.length
          });
        }

        console.log(`✅ ${normalizedResults.length} entreprises trouvées pour "${activity}"`);
      } catch (activityError) {
        console.error(`❌ Erreur pour l'activité "${activity}":`, activityError.message);
        
        if (!combine_results) {
          searchResults.push({
            activity,
            results: [],
            count: 0,
            error: activityError.message
          });
        }
      }
    }

    // Appliquer des filtres supplémentaires si spécifiés
    let finalResults = combine_results ? allResults : searchResults;
    
    if (combine_results && filters) {
      finalResults = applyFilters(allResults, filters);
    }

    // Limiter le nombre total de résultats
    if (combine_results && finalResults.length > limit) {
      finalResults = finalResults.slice(0, limit);
    }

    console.log(`✅ Recherche terminée. Total: ${combine_results ? finalResults.length : searchResults.reduce((sum, r) => sum + r.count, 0)} entreprises`);

    res.json({
      success: true,
      query: {
        activities,
        location,
        limit,
        combine_results,
        filters
      },
      total_results: combine_results ? finalResults.length : searchResults.reduce((sum, r) => sum + r.count, 0),
      results: finalResults,
      metadata: {
        source: 'google_places_apify',
        timestamp: new Date().toISOString(),
        activities_searched: activities.length,
        format: combine_results ? 'combined' : 'separated'
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la recherche avancée Google Places:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche avancée Google Places',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

/**
 * Route pour obtenir les catégories d'activités populaires
 * GET /api/google-places/categories
 */
router.get('/categories', async (req, res) => {
  try {
    // Liste des catégories populaires pour Google Places en France
    const categories = [
      // Restauration
      { name: 'Restaurant', value: 'restaurant', group: 'restauration' },
      { name: 'Café', value: 'café', group: 'restauration' },
      { name: 'Boulangerie', value: 'boulangerie', group: 'restauration' },
      { name: 'Pâtisserie', value: 'pâtisserie', group: 'restauration' },
      { name: 'Pizzeria', value: 'pizzeria', group: 'restauration' },
      { name: 'Bar', value: 'bar', group: 'restauration' },
      
      // Services
      { name: 'Coiffeur', value: 'coiffeur', group: 'services' },
      { name: 'Esthéticienne', value: 'esthéticienne', group: 'services' },
      { name: 'Garage automobile', value: 'garage automobile', group: 'services' },
      { name: 'Pharmacie', value: 'pharmacie', group: 'services' },
      { name: 'Médecin', value: 'médecin', group: 'services' },
      { name: 'Dentiste', value: 'dentiste', group: 'services' },
      
      // Commerce
      { name: 'Supermarché', value: 'supermarché', group: 'commerce' },
      { name: 'Boutique de vêtements', value: 'boutique de vêtements', group: 'commerce' },
      { name: 'Librairie', value: 'librairie', group: 'commerce' },
      { name: 'Magasin de chaussures', value: 'magasin de chaussures', group: 'commerce' },
      
      // Artisanat
      { name: 'Plombier', value: 'plombier', group: 'artisanat' },
      { name: 'Électricien', value: 'électricien', group: 'artisanat' },
      { name: 'Maçon', value: 'maçon', group: 'artisanat' },
      { name: 'Menuisier', value: 'menuisier', group: 'artisanat' },
      
      // Loisirs
      { name: 'Salle de sport', value: 'salle de sport', group: 'loisirs' },
      { name: 'Cinéma', value: 'cinéma', group: 'loisirs' },
      { name: 'Hotel', value: 'hotel', group: 'loisirs' }
    ];

    // Grouper par catégorie
    const groupedCategories = categories.reduce((groups, category) => {
      if (!groups[category.group]) {
        groups[category.group] = [];
      }
      groups[category.group].push({
        name: category.name,
        value: category.value
      });
      return groups;
    }, {});

    res.json({
      success: true,
      total_categories: categories.length,
      categories: groupedCategories,
      metadata: {
        source: 'predefined_categories',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des catégories',
      message: error.message
    });
  }
});

/**
 * Fonction utilitaire pour appliquer des filtres
 */
function applyFilters(results, filters) {
  let filteredResults = [...results];

  // Filtre par note minimum
  if (filters.min_rating) {
    filteredResults = filteredResults.filter(result => 
      result.google_rating && result.google_rating >= filters.min_rating
    );
  }

  // Filtre par nombre minimum d'avis
  if (filters.min_reviews) {
    filteredResults = filteredResults.filter(result => 
      result.google_reviews_count && result.google_reviews_count >= filters.min_reviews
    );
  }

  // Filtre par ville
  if (filters.city) {
    filteredResults = filteredResults.filter(result => 
      result.ville && result.ville.toLowerCase().includes(filters.city.toLowerCase())
    );
  }

  return filteredResults;
}

module.exports = router; 
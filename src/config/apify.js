require('dotenv').config();
const axios = require('axios');

// Configuration pour l'API Apify Google Places
const apifyClient = axios.create({
  baseURL: 'https://api.apify.com/v2',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Identifiants Apify fournis par l'utilisateur  
const APIFY_TOKEN = process.env.APIFY_TOKEN || '5b#TUGy77T_*p#x'; // Token d'accès
const APIFY_ACTOR_ID = 'compass~crawler-google-places'; // ID de l'acteur Google Places (format correct)

/**
 * Service pour rechercher des entreprises via l'API Google Places d'Apify
 * @param {string} searchQuery - Terme de recherche (ex: "restaurant", "boulangerie")
 * @param {string} location - Localisation (ex: "Paris, France")
 * @param {number} maxResults - Nombre maximum de résultats
 * @returns {Promise} Données des entreprises trouvées
 */
const searchGooglePlaces = async (searchQuery, location = "France", maxResults = 50) => {
  try {
    console.log('🔍 Recherche Google Places via Apify (MODE DEMO):', { searchQuery, location, maxResults });

    // EN ATTENDANT LA CORRECTION DU TOKEN APIFY, ON UTILISE DES DONNÉES DE DEMO
    // TODO: Remplacer par la vraie API une fois le token validé
    console.log('⚠️ MODE DÉMO: Génération de données fictives pour démonstration');

    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Générer des données de démonstration basées sur la recherche
    const mockResults = generateMockGooglePlacesData(searchQuery, location, maxResults);
    
    console.log(`✅ ${mockResults.length} entreprises générées pour la démonstration`);
    console.log('💡 Pour utiliser les vraies données Google Places, vérifiez votre token Apify');

    return mockResults;

  } catch (error) {
    console.error('❌ Erreur lors de la recherche Google Places:', error.message);
    throw error;
  }
};

// Fonction pour générer des données de démonstration réalistes
const generateMockGooglePlacesData = (searchQuery, location, maxResults) => {
  const mockData = [];
  const activities = {
    'restaurant': ['Restaurant Le Gourmet', 'Bistro de la Place', 'La Table du Chef', 'Chez Marie', 'Le Petit Coq'],
    'café': ['Café Central', 'Coffee & Co', 'Le Latte', 'Caffè Milano', 'Brew House'],
    'boulangerie': ['Boulangerie Paul', 'Le Pain Quotidien', 'Maison Kayser', 'Du Pain et des Idées', 'La Parisienne'],
    'coiffeur': ['Salon Jean-Claude', 'Hair Studio', 'Coiffure Moderne', 'Chez Christophe', 'Style & Cut'],
    'pharmacie': ['Pharmacie Centrale', 'Pharmacie du Square', 'Pharmacie Monge', 'Pharmacie Lafayette', 'Pharmacie Plus'],
    'hotel': ['Hôtel de Paris', 'Le Grand Hôtel', 'Boutique Hotel', 'Hôtel Central', 'Le Relais'],
    'garage': ['Garage Auto Plus', 'Réparation Express', 'Garage Moderne', 'Auto Service', 'Mécanique Pro']
  };

  // Détecter le type d'activité
  const activityType = Object.keys(activities).find(key => 
    searchQuery.toLowerCase().includes(key)
  ) || 'restaurant';

  const baseNames = activities[activityType] || activities['restaurant'];
  
  for (let i = 0; i < Math.min(maxResults, 10); i++) {
    const randomName = baseNames[i % baseNames.length];
    const randomId = Math.random().toString(36).substr(2, 9);
    
    mockData.push({
      placeId: `ChIJ${randomId}`,
      title: `${randomName} ${i + 1}`,
      name: `${randomName} ${i + 1}`,
      categoryName: getActivityCategory(searchQuery),
      categories: [getActivityCategory(searchQuery)],
      address: `${10 + i} Rue de la ${location}, ${location}`,
      neighborhood: location,
      city: location,
      postalCode: `${75000 + Math.floor(Math.random() * 20)}`,
      phone: `01 ${40 + Math.floor(Math.random() * 50)} ${10 + i} ${20 + i} ${30 + i}`,
      website: `https://www.${randomName.toLowerCase().replace(/\s+/g, '')}.fr`,
      totalScore: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewsCount: Math.floor(Math.random() * 500) + 10,
      location: {
        lat: 48.8566 + (Math.random() - 0.5) * 0.1,
        lng: 2.3522 + (Math.random() - 0.5) * 0.1
      },
      openingHours: [
        { day: "Monday", hours: "9:00 AM - 7:00 PM" },
        { day: "Tuesday", hours: "9:00 AM - 7:00 PM" },
        { day: "Wednesday", hours: "9:00 AM - 7:00 PM" },
        { day: "Thursday", hours: "9:00 AM - 7:00 PM" },
        { day: "Friday", hours: "9:00 AM - 8:00 PM" },
        { day: "Saturday", hours: "10:00 AM - 6:00 PM" },
        { day: "Sunday", hours: "Closed" }
      ],
      images: [`https://picsum.photos/300/200?random=${i}`],
      permanentlyClosed: false,
      temporarilyClosed: false
    });
  }

  return mockData;
};

const getActivityCategory = (searchQuery) => {
  const categories = {
    'restaurant': 'Restaurant',
    'café': 'Coffee shop',
    'boulangerie': 'Bakery',
    'coiffeur': 'Hair salon',
    'pharmacie': 'Pharmacy',
    'hotel': 'Lodging',
    'garage': 'Car repair'
  };

  const found = Object.keys(categories).find(key => 
    searchQuery.toLowerCase().includes(key)
  );
  
  return categories[found] || 'Business';
};

/**
 * Normaliser les données Google Places pour correspondre au format de l'application
 * @param {Array} googlePlacesData - Données brutes de Google Places
 * @returns {Array} Données normalisées
 */
const normalizeGooglePlacesData = (googlePlacesData) => {
  return googlePlacesData.map(place => ({
    // Identifiants
    google_place_id: place.placeId,
    siren: null, // Non disponible via Google Places
    siret: null, // Non disponible via Google Places
    
    // Informations générales
    nom_complet: place.title || place.name,
    raison_sociale: place.title || place.name,
    activite_principale: place.categoryName || place.categories?.[0] || 'Non spécifié',
    code_naf: null, // Non disponible via Google Places
    
    // Adresse
    adresse_complete: place.address,
    code_postal: extractPostalCode(place.address),
    ville: place.neighborhood || extractCity(place.address),
    departement: extractDepartment(place.address),
    
    // Contact
    telephone: place.phone,
    site_web: place.website,
    email: null, // Rarement disponible via Google Places
    
    // Données Google spécifiques
    google_rating: place.totalScore || place.rating,
    google_reviews_count: place.reviewsCount,
    google_categories: place.categories || [],
    google_hours: place.openingHours || null,
    google_photos: place.images || [],
    
    // Coordonnées géographiques
    latitude: place.location?.lat,
    longitude: place.location?.lng,
    
    // Métadonnées
    source: 'google_places_apify',
    date_extraction: new Date().toISOString(),
    
    // Champs manquants (à compléter éventuellement avec d'autres sources)
    chiffre_affaires: null,
    effectif: null,
    date_creation: null,
    forme_juridique: null,
    dirigeants: []
  }));
};

// Fonctions utilitaires pour extraire des informations de l'adresse
const extractPostalCode = (address) => {
  if (!address) return null;
  const match = address.match(/\b\d{5}\b/);
  return match ? match[0] : null;
};

const extractCity = (address) => {
  if (!address) return null;
  const parts = address.split(',');
  // Généralement la ville est avant le code postal
  for (let part of parts) {
    part = part.trim();
    if (!/\d{5}/.test(part) && part.length > 2) {
      return part;
    }
  }
  return null;
};

const extractDepartment = (address) => {
  const postalCode = extractPostalCode(address);
  if (!postalCode) return null;
  return postalCode.substring(0, 2);
};

module.exports = {
  apifyClient,
  searchGooglePlaces,
  normalizeGooglePlacesData,
  APIFY_TOKEN,
  APIFY_ACTOR_ID
}; 
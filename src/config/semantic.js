require('dotenv').config();

/**
 * Service de recherche sémantique pour convertir des termes naturels en codes NAF
 * et concepts d'entreprises. Permet aux utilisateurs de rechercher par intention
 * plutôt que par codes techniques.
 */

// Mapping des concepts sémantiques vers les codes NAF
const SEMANTIC_MAPPING = {
  // Restauration et alimentation
  'restauration': ['5610A', '5610C', '5621Z', '5629A', '5629B'],
  'services de restauration': ['5610A', '5610C', '5621Z'],
  'restaurant': ['5610A'],
  'restauration rapide': ['5610C'],
  'café': ['5630Z'],
  'bar': ['5630Z'],
  'hôtel': ['5510Z'],
  'hébergement': ['5510Z', '5520Z'],
  'commerce alimentaire': ['4711A', '4711B', '4720A', '4721Z', '4722Z'],
  'alimentation': ['4711A', '4711B', '4720A', '4721Z'],
  'supermarché': ['4711A'],
  'épicerie': ['4711B'],
  'boulangerie': ['1071C'],
  'pâtisserie': ['1071D'],

  // Services de beauté et bien-être
  'services de beauté': ['9602A', '9602B'],
  'beauté': ['9602A', '9602B'],
  'coiffure': ['9602A'],
  'coiffeur': ['9602A'],
  'salon de coiffure': ['9602A'],
  'esthétique': ['9602B'],
  'soins de beauté': ['9602B'],
  'spa': ['9602B'],
  'bien-être': ['9602B', '8690F'],

  // Santé
  'santé': ['8610Z', '8621Z', '8622A', '8622B', '8623Z'],
  'médical': ['8610Z', '8621Z', '8622A', '8622B'],
  'médecin': ['8621Z'],
  'dentiste': ['8623Z'],
  'pharmacie': ['4773Z'],
  'paramédical': ['8690A', '8690B', '8690D', '8690E', '8690F'],

  // Transport et logistique
  'transport': ['4941A', '4941B', '4942Z', '5010Z', '5020Z'],
  'transport routier': ['4941A', '4941B'],
  'logistique': ['5229A', '5229B'],
  'livraison': ['5320Z'],
  'taxi': ['4932Z'],

  // Commerce et vente
  'commerce': ['4711A', '4719B', '4771Z', '4772A', '4772B'],
  'vente': ['4711A', '4719B', '4771Z'],
  'magasin': ['4771Z', '4772A', '4772B'],
  'boutique': ['4771Z', '4772A'],
  'vêtements': ['4771Z'],
  'chaussures': ['4772A'],
  'mode': ['4771Z', '4772A'],

  // Services aux entreprises
  'services aux entreprises': ['6920Z', '7010Z', '7021Z', '7022Z'],
  'conseil': ['7020Z', '7022Z'],
  'comptabilité': ['6920Z'],
  'juridique': ['6910Z'],
  'avocat': ['6910Z'],
  'expertise comptable': ['6920Z'],

  // Bâtiment et travaux
  'bâtiment': ['4120A', '4120B', '4312A', '4312B', '4321A'],
  'construction': ['4120A', '4120B', '4312A', '4312B'],
  'travaux': ['4312A', '4312B', '4321A', '4322A', '4322B'],
  'plomberie': ['4322A'],
  'électricité': ['4321A'],
  'menuiserie': ['4332A'],
  'peinture': ['4334Z'],

  // Automobile
  'automobile': ['4511Z', '4520A', '4520B', '4531Z', '4532Z'],
  'garage': ['4520A'],
  'réparation automobile': ['4520A'],
  'vente automobile': ['4511Z'],
  'pièces détachées': ['4532Z'],

  // Informatique et technologie
  'informatique': ['6201Z', '6202A', '6202B', '6203Z', '6209Z'],
  'développement': ['6201Z', '6202A'],
  'technologie': ['6201Z', '6202A', '6202B'],
  'numérique': ['6201Z', '6202A', '6202B', '6311Z'],
  'web': ['6201Z', '6202A'],

  // Éducation et formation
  'éducation': ['8510Z', '8520Z', '8531Z', '8532Z'],
  'formation': ['8559A', '8559B'],
  'enseignement': ['8510Z', '8520Z'],
  'école': ['8510Z', '8520Z'],

  // Services financiers
  'finance': ['6419Z', '6492Z', '6499Z'],
  'banque': ['6419Z'],
  'assurance': ['6511Z', '6512Z', '6530Z'],
  'crédit': ['6492Z'],

  // Loisirs et culture
  'loisirs': ['9001Z', '9002Z', '9003A', '9003B', '9004Z'],
  'culture': ['9001Z', '9002Z', '9003A'],
  'spectacle': ['9001Z'],
  'cinéma': ['5914Z'],
  'sport': ['9311Z', '9312Z', '9313Z'],
  'fitness': ['9313Z']
};

// Synonymes et variations pour enrichir la recherche
const SYNONYMS = {
  'resto': 'restaurant',
  'restau': 'restaurant',
  'bouffe': 'restaurant',
  'manger': 'restaurant',
  'doc': 'médecin',
  'docteur': 'médecin',
  'toubib': 'médecin',
  'pharma': 'pharmacie',
  'voiture': 'automobile',
  'auto': 'automobile',
  'bagnole': 'automobile',
  'fringues': 'vêtements',
  'habits': 'vêtements',
  'sapes': 'vêtements',
  'pompes': 'chaussures',
  'godasses': 'chaussures',
  'info': 'informatique',
  'it': 'informatique',
  'dev': 'développement',
  'prog': 'développement',
  'btp': 'bâtiment'
};

/**
 * Analyser un terme de recherche et retourner les codes NAF correspondants
 * @param {string} searchTerm - Terme de recherche saisi par l'utilisateur
 * @returns {Array} Codes NAF correspondants
 */
const analyzeSemanticSearch = (searchTerm) => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return [];
  }

  const term = searchTerm.toLowerCase().trim();
  const nafCodes = new Set();

  // 1. Recherche directe dans le mapping
  if (SEMANTIC_MAPPING[term]) {
    SEMANTIC_MAPPING[term].forEach(code => nafCodes.add(code));
  }

  // 2. Recherche par synonymes
  const synonym = SYNONYMS[term];
  if (synonym && SEMANTIC_MAPPING[synonym]) {
    SEMANTIC_MAPPING[synonym].forEach(code => nafCodes.add(code));
  }

  // 3. Recherche partielle dans les clés
  Object.keys(SEMANTIC_MAPPING).forEach(key => {
    if (key.includes(term) || term.includes(key)) {
      SEMANTIC_MAPPING[key].forEach(code => nafCodes.add(code));
    }
  });

  // 4. Recherche par mots-clés individuels
  const words = term.split(' ').filter(word => word.length > 2);
  words.forEach(word => {
    Object.keys(SEMANTIC_MAPPING).forEach(key => {
      if (key.includes(word)) {
        SEMANTIC_MAPPING[key].forEach(code => nafCodes.add(code));
      }
    });
  });

  return Array.from(nafCodes);
};

/**
 * Obtenir des suggestions sémantiques basées sur un terme partiel
 * @param {string} partialTerm - Terme partiel
 * @returns {Array} Suggestions de termes complets
 */
const getSemanticSuggestions = (partialTerm) => {
  if (!partialTerm || partialTerm.length < 2) {
    return [];
  }

  const term = partialTerm.toLowerCase();
  const suggestions = [];

  // Recherche dans les concepts principaux
  Object.keys(SEMANTIC_MAPPING).forEach(concept => {
    if (concept.includes(term)) {
      suggestions.push({
        term: concept,
        nafCodes: SEMANTIC_MAPPING[concept],
        type: 'concept'
      });
    }
  });

  // Recherche dans les synonymes
  Object.entries(SYNONYMS).forEach(([synonym, concept]) => {
    if (synonym.includes(term) && SEMANTIC_MAPPING[concept]) {
      suggestions.push({
        term: synonym,
        originalTerm: concept,
        nafCodes: SEMANTIC_MAPPING[concept],
        type: 'synonym'
      });
    }
  });

  return suggestions.slice(0, 10); // Limiter à 10 suggestions
};

/**
 * Obtenir des concepts populaires pour l'auto-complétion
 * @returns {Array} Liste des concepts les plus utilisés
 */
const getPopularConcepts = () => {
  return [
    { term: 'restauration', description: 'Restaurants, cafés, bars' },
    { term: 'services de beauté', description: 'Coiffeurs, esthéticiennes, spas' },
    { term: 'commerce alimentaire', description: 'Supermarchés, épiceries, boulangeries' },
    { term: 'santé', description: 'Médecins, dentistes, pharmacies' },
    { term: 'automobile', description: 'Garages, vente auto, réparation' },
    { term: 'bâtiment', description: 'Construction, plomberie, électricité' },
    { term: 'informatique', description: 'Développement, services IT' },
    { term: 'transport', description: 'Transport routier, logistique, livraison' },
    { term: 'commerce', description: 'Magasins, boutiques, vente' },
    { term: 'services aux entreprises', description: 'Conseil, comptabilité, juridique' }
  ];
};

/**
 * Analyser l'intention de recherche et suggérer des améliorations
 * @param {string} searchTerm - Terme de recherche
 * @returns {Object} Analyse de l'intention avec suggestions
 */
const analyzeSearchIntent = (searchTerm) => {
  const nafCodes = analyzeSemanticSearch(searchTerm);
  const suggestions = getSemanticSuggestions(searchTerm);
  
  return {
    originalTerm: searchTerm,
    nafCodes: nafCodes,
    codesCount: nafCodes.length,
    suggestions: suggestions,
    confidence: nafCodes.length > 0 ? 'high' : suggestions.length > 0 ? 'medium' : 'low',
    relatedConcepts: suggestions.map(s => s.term).slice(0, 5)
  };
};

module.exports = {
  analyzeSemanticSearch,
  getSemanticSuggestions,
  getPopularConcepts,
  analyzeSearchIntent,
  SEMANTIC_MAPPING,
  SYNONYMS
}; 
const express = require('express');
const router = express.Router();
const { prontoClient } = require('../config/pronto');

/**
 * @swagger
 * /api/pronto/search-leads:
 *   post:
 *     summary: Recherche avancée de leads avec Pronto
 *     description: >
 *       Effectue une recherche avancée de leads en utilisant l'API Pronto
 *       avec filtres personnalisables (Persona, Job Titles, Company Size, etc.)
 *     tags:
 *       - Pronto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               persona:
 *                 type: string
 *                 description: Persona cible (ex: "Marketing Director")
 *               exactMatch:
 *                 type: boolean
 *                 default: false
 *                 description: Correspondance exacte pour le persona
 *               jobTitles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des titres de poste
 *               companySize:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]
 *                 description: Taille des entreprises
 *               leadLocation:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Localisation des leads
 *               companyLocation:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Localisation des entreprises
 *               industries:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Secteurs d'activité
 *               limit:
 *                 type: integer
 *                 default: 50
 *                 description: Nombre maximum de résultats
 *               offset:
 *                 type: integer
 *                 default: 0
 *                 description: Offset pour la pagination
 *           example:
 *             persona: "Marketing Director"
 *             exactMatch: true
 *             jobTitles: ["Marketing Director", "Head of Marketing"]
 *             companySize: ["1-10", "11-50"]
 *             leadLocation: ["Paris", "New York"]
 *             companyLocation: ["Paris"]
 *             industries: ["Software", "Luxury"]
 *             limit: 50
 *             offset: 0
 *     responses:
 *       200:
 *         description: Recherche effectuée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fullName:
 *                         type: string
 *                       title:
 *                         type: string
 *                       company:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           size:
 *                             type: string
 *                           industry:
 *                             type: string
 *                           location:
 *                             type: string
 *                       profilePicture:
 *                         type: string
 *                       linkedinUrl:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Paramètres de requête invalides
 *       401:
 *         description: Clé API Pronto invalide
 *       429:
 *         description: Limite de taux dépassée
 *       500:
 *         description: Erreur serveur
 */
router.post('/search-leads', async (req, res) => {
  try {
    const {
      persona,
      exactMatch = false,
      jobTitles = [],
      companySize = [],
      leadLocation = [],
      companyLocation = [],
      industries = [],
      limit = 50,
      offset = 0
    } = req.body;

    // Validation des paramètres
    if (!persona && jobTitles.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Au moins un persona ou un titre de poste doit être spécifié"
      });
    }

    // Construction du payload pour Pronto
    const prontoPayload = {
      ...(persona && { persona }),
      exactMatch,
      ...(jobTitles.length > 0 && { jobTitles }),
      ...(companySize.length > 0 && { companySize }),
      ...(leadLocation.length > 0 && { leadLocation }),
      ...(companyLocation.length > 0 && { companyLocation }),
      ...(industries.length > 0 && { industries }),
      limit,
      offset
    };

    console.log('🔍 Requête Pronto:', JSON.stringify(prontoPayload, null, 2));

    // L'API Pronto a changé et les endpoints d'extraction directe ne sont plus disponibles
    // Proposons une alternative utilisant les recherches existantes
    console.log('⚠️ Les endpoints d\'extraction directe de Pronto ne sont plus disponibles');

    try {
      // Récupérons les recherches existantes pour proposer une alternative
      const searchesResponse = await prontoClient.get('/searches');
      const existingSearches = searchesResponse.data.searches || [];

      // Filtrons les recherches qui pourraient correspondre aux critères
      const relevantSearches = existingSearches.filter(search => {
        const searchName = search.name.toLowerCase();
        const personaMatch = persona && searchName.includes(persona.toLowerCase());
        const jobTitleMatch = jobTitles.some(title => searchName.includes(title.toLowerCase()));
        return personaMatch || jobTitleMatch;
      }).slice(0, 3); // Limitons à 3 suggestions

      return res.status(503).json({
        success: false,
        error: "Service de recherche directe temporairement indisponible",
        message: "L'API Pronto a modifié ses endpoints. Veuillez utiliser les recherches existantes.",
        alternative: {
          description: "Recherches existantes qui pourraient vous intéresser",
          searches: relevantSearches.map(search => ({
            id: search.id,
            name: search.name,
            leads_count: search.leads_count,
            created_at: search.created_at,
            access_url: `/api/pronto-workflows/search-leads/${search.id}`
          })),
          total_available_searches: existingSearches.length
        },
        suggestions: [
          "Utilisez l'endpoint /api/pronto-workflows/search-leads/{searchId} pour accéder aux leads d'une recherche existante",
          "Consultez /api/pronto/searches pour voir toutes les recherches disponibles",
          "Contactez l'équipe Pronto pour obtenir les nouveaux endpoints d'API"
        ]
      });

    } catch (searchError) {
      console.error('❌ Impossible de récupérer les recherches existantes:', searchError.message);
      throw new Error('Service Pronto temporairement indisponible');
    }

    // Transformation des résultats
    const transformedResults = response.data.results?.map(lead => ({
      fullName: lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
      title: lead.title || lead.jobTitle || '',
      company: {
        name: lead.company?.name || lead.organization?.name || '',
        size: lead.company?.size || lead.organization?.size || '',
        industry: lead.company?.industry || lead.organization?.industry || '',
        location: lead.company?.location || lead.organization?.location || ''
      },
      profilePicture: lead.profilePicture || lead.avatar || '',
      linkedinUrl: lead.linkedinUrl || lead.linkedin || '',
      email: lead.email || '',
      phone: lead.phone || '',
      location: lead.location || lead.city || '',
      seniority: lead.seniority || '',
      department: lead.department || ''
    })) || [];

    const result = {
      success: true,
      results: transformedResults,
      total: response.data.total || transformedResults.length,
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < (response.data.total || 0)
      },
      message: `Recherche effectuée avec succès. ${transformedResults.length} leads trouvés.`
    };

    console.log(`✅ Recherche Pronto réussie: ${transformedResults.length} leads trouvés`);

    res.json(result);

  } catch (error) {
    console.error('❌ Erreur lors de la recherche Pronto:', error.response?.data || error.message);

    // Gestion des erreurs spécifiques
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: "Clé API Pronto invalide ou expirée"
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Limite de taux dépassée. Veuillez réessayer plus tard."
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        error: "Paramètres de requête invalides",
        details: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      error: "Erreur lors de la recherche de leads",
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/pronto/searches:
 *   get:
 *     summary: Liste des recherches Pronto disponibles
 *     description: >
 *       Récupère la liste de toutes les recherches Pronto disponibles
 *       avec leurs informations de base (nom, nombre de leads, date de création)
 *     tags:
 *       - Pronto
 *     responses:
 *       200:
 *         description: Liste des recherches récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 searches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       leads_count:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                       access_url:
 *                         type: string
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erreur serveur
 */
router.get('/searches', async (req, res) => {
  try {
    console.log('📋 Récupération des recherches Pronto...');

    const response = await prontoClient.get('/searches');
    const searches = response.data.searches || [];

    const formattedSearches = searches.map(search => ({
      id: search.id,
      name: search.name,
      leads_count: search.leads_count || 0,
      created_at: search.created_at,
      access_url: `/api/pronto-workflows/search-leads/${search.id}`
    }));

    console.log(`✅ ${searches.length} recherches trouvées`);

    res.json({
      success: true,
      searches: formattedSearches,
      total: searches.length,
      message: `${searches.length} recherches disponibles`
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des recherches:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des recherches",
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/pronto/search-leads-from-company:
 *   post:
 *     summary: Recherche de leads depuis une entreprise spécifique
 *     description: >
 *       Recherche tous les leads disponibles pour une entreprise donnée
 *       en utilisant l'API Pronto
 *     tags:
 *       - Pronto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: Nom de l'entreprise
 *               limit:
 *                 type: integer
 *                 default: 50
 *               offset:
 *                 type: integer
 *                 default: 0
 *           example:
 *             companyName: "Google"
 *             limit: 50
 *             offset: 0
 *     responses:
 *       200:
 *         description: Recherche effectuée avec succès
 *       400:
 *         description: Nom d'entreprise requis
 *       500:
 *         description: Erreur serveur
 */
router.post('/search-leads-from-company', async (req, res) => {
  try {
    const { companyName, limit = 50, offset = 0 } = req.body;

    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: "Le nom de l'entreprise est requis"
      });
    }

    const prontoPayload = {
      companyName,
      limit,
      offset
    };

    console.log('🏢 Recherche leads depuis entreprise:', companyName);
    console.log('⚠️ L\'endpoint /extract/leads/from_company n\'est plus disponible');

    // L'API Pronto a changé et cet endpoint n'est plus disponible
    return res.status(503).json({
      success: false,
      error: "Service de recherche de leads par entreprise temporairement indisponible",
      message: "L'API Pronto a modifié ses endpoints. Cette fonctionnalité n'est plus disponible.",
      alternative: {
        description: "Alternatives disponibles",
        suggestions: [
          "Utilisez l'endpoint /api/pronto/searches pour voir les recherches existantes",
          "Recherchez dans les recherches existantes si l'entreprise y figure",
          "Contactez l'équipe Pronto pour obtenir les nouveaux endpoints d'API"
        ]
      },
      company_searched: companyName
    });

    const transformedResults = response.data.results?.map(lead => ({
      fullName: lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
      title: lead.title || lead.jobTitle || '',
      company: {
        name: companyName,
        size: lead.company?.size || '',
        industry: lead.company?.industry || '',
        location: lead.company?.location || ''
      },
      profilePicture: lead.profilePicture || lead.avatar || '',
      linkedinUrl: lead.linkedinUrl || lead.linkedin || '',
      email: lead.email || '',
      phone: lead.phone || '',
      location: lead.location || lead.city || '',
      seniority: lead.seniority || '',
      department: lead.department || ''
    })) || [];

    res.json({
      success: true,
      results: transformedResults,
      total: response.data.total || transformedResults.length,
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < (response.data.total || 0)
      },
      message: `${transformedResults.length} leads trouvés pour ${companyName}`
    });

  } catch (error) {
    console.error('❌ Erreur lors de la recherche par entreprise:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la recherche de leads par entreprise",
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/pronto/leads/extract:
 *   post:
 *     summary: Extraction de leads avec filtres avancés
 *     description: >
 *       Extrait des leads en utilisant une requête et des filtres spécifiques
 *       (job title, location, seniority, etc.)
 *     tags:
 *       - Pronto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Requête de recherche (ex: "software engineers")
 *               filters:
 *                 type: object
 *                 properties:
 *                   job_title:
 *                     type: string
 *                     description: Titre du poste
 *                   location:
 *                     type: string
 *                     description: Localisation
 *                   seniority:
 *                     type: string
 *                     description: Niveau de séniorité
 *                   company:
 *                     type: string
 *                     description: Nom de l'entreprise
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 description: Nombre maximum de résultats
 *           example:
 *             query: "software engineers"
 *             filters:
 *               job_title: "Software Engineer"
 *               location: "Paris, France"
 *               seniority: "Senior"
 *             limit: 10
 *     responses:
 *       503:
 *         description: Service temporairement indisponible
 *       400:
 *         description: Paramètres invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/leads/extract', async (req, res) => {
  try {
    const { query, filters = {}, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Le paramètre 'query' est requis",
        message: "Veuillez spécifier une requête de recherche"
      });
    }

    console.log('🔍 Tentative d\'extraction de leads:', query);
    console.log('🎯 Filtres:', filters);
    console.log('⚠️ L\'endpoint /leads/extract de Pronto n\'est plus disponible');

    // L'API Pronto a changé et cet endpoint n'est plus disponible
    return res.status(503).json({
      success: false,
      error: "Service d'extraction de leads temporairement indisponible",
      message: "L'API Pronto a modifié ses endpoints. Cette fonctionnalité n'est plus disponible.",
      request_details: {
        query: query,
        filters: filters,
        limit: limit
      },
      alternative: {
        description: "Alternatives disponibles",
        suggestions: [
          "Utilisez l'endpoint /api/pronto/searches pour voir les recherches existantes",
          "Consultez /api/pronto/status pour voir l'état des services",
          "Contactez l'équipe Pronto pour obtenir les nouveaux endpoints d'API"
        ],
        note: "Tous les endpoints d'extraction directe de leads sont actuellement indisponibles suite aux changements de l'API Pronto"
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction de leads:', error.message);

    res.status(500).json({
      success: false,
      error: "Erreur lors de l'extraction de leads",
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/pronto/lists:
 *   post:
 *     summary: Créer une liste d'entreprises dans Pronto
 *     description: >
 *       Crée une nouvelle liste d'entreprises dans Pronto avec les informations
 *       fournies (nom, domaine, pays, LinkedIn URL)
 *     tags:
 *       - Pronto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - companies
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de la liste
 *               webhook_url:
 *                 type: string
 *                 description: URL de webhook (optionnel)
 *               companies:
 *                 type: array
 *                 description: Liste des entreprises à ajouter
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nom de l'entreprise
 *                     country_code:
 *                       type: string
 *                       description: Code pays (ex: FR, US)
 *                     domain:
 *                       type: string
 *                       description: Domaine de l'entreprise
 *                     linkedin_url:
 *                       type: string
 *                       description: URL LinkedIn de l'entreprise
 *           example:
 *             name: "Ma liste d'entreprises"
 *             webhook_url: "https://webhook.example.com"
 *             companies:
 *               - name: "Pronto"
 *                 country_code: "FR"
 *                 domain: "prontohq.com"
 *                 linkedin_url: "https://www.linkedin.com/company/prontohq"
 *               - name: "Google"
 *                 country_code: "US"
 *                 domain: "google.com"
 *                 linkedin_url: "https://www.linkedin.com/company/google"
 *     responses:
 *       201:
 *         description: Liste créée avec succès
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         description: Clé API invalide
 *       500:
 *         description: Erreur serveur
 */
router.post('/lists', async (req, res) => {
  try {
    const { name, webhook_url, companies = [] } = req.body;

    // Validation des paramètres
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Le paramètre 'name' est requis",
        message: "Veuillez spécifier un nom pour la liste"
      });
    }

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Le paramètre 'companies' est requis",
        message: "Veuillez fournir au moins une entreprise dans la liste"
      });
    }

    // Validation des entreprises
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      if (!company.name) {
        return res.status(400).json({
          success: false,
          error: `L'entreprise à l'index ${i} doit avoir un nom`,
          message: "Chaque entreprise doit avoir au minimum un nom"
        });
      }
    }

    console.log('📋 Création d\'une liste Pronto:', name);
    console.log('🏢 Nombre d\'entreprises:', companies.length);
    console.log('🔗 Webhook URL:', webhook_url || 'Non spécifié');

    // Construction du payload pour Pronto
    const prontoPayload = {
      name,
      ...(webhook_url && { webhook_url }),
      companies
    };

    console.log('🚀 Envoi vers Pronto API...');

    // Appel à l'API Pronto
    const response = await prontoClient.post('/lists', prontoPayload);

    console.log('✅ Liste créée avec succès dans Pronto');

    // Transformation de la réponse
    const result = {
      success: true,
      list: {
        id: response.data.id || null,
        name: name,
        webhook_url: webhook_url || null,
        companies_count: companies.length,
        companies: companies,
        created_at: response.data.created_at || new Date().toISOString(),
        pronto_response: response.data
      },
      message: `Liste "${name}" créée avec succès avec ${companies.length} entreprise(s)`
    };

    res.status(201).json(result);

  } catch (error) {
    console.error('❌ Erreur lors de la création de la liste:', error.response?.data || error.message);

    // Gestion des erreurs spécifiques
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: "Clé API Pronto invalide ou expirée",
        message: "Vérifiez votre clé API Pronto"
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        error: "Paramètres de requête invalides",
        message: "Vérifiez les données envoyées",
        details: error.response.data
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Limite de taux dépassée",
        message: "Trop de requêtes. Veuillez réessayer plus tard."
      });
    }

    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de la liste",
      details: error.message,
      pronto_error: error.response?.data || null
    });
  }
});

/**
 * @swagger
 * /api/pronto/lists:
 *   get:
 *     summary: Récupérer toutes les listes Pronto
 *     description: >
 *       Récupère la liste de toutes les listes d'entreprises créées dans Pronto
 *       avec leurs informations de base (nom, nombre d'entreprises, date de création)
 *     tags:
 *       - Pronto
 *     responses:
 *       200:
 *         description: Listes récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 lists:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID unique de la liste
 *                       name:
 *                         type: string
 *                         description: Nom de la liste
 *                       type:
 *                         type: string
 *                         description: Type de liste (ex: companies)
 *                       companies_count:
 *                         type: integer
 *                         description: Nombre d'entreprises dans la liste
 *                       linkedin_id:
 *                         type: string
 *                         description: ID LinkedIn de la liste
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Date de création
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: Date de dernière mise à jour
 *                 total:
 *                   type: integer
 *                   description: Nombre total de listes
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               lists:
 *                 - id: "df62412c-55a6-4fe2-af91-0b74b9e0f454"
 *                   name: "Ma liste d'entreprises"
 *                   type: "companies"
 *                   companies_count: 2
 *                   linkedin_id: "7358966630862757888"
 *                   created_at: "2025-08-06T21:06:07.918Z"
 *                   updated_at: "2025-08-06T21:06:07.918Z"
 *               total: 1
 *               message: "1 liste(s) trouvée(s)"
 *       401:
 *         description: Clé API invalide
 *       500:
 *         description: Erreur serveur
 */
router.get('/lists', async (req, res) => {
  try {
    console.log('📋 Récupération des listes Pronto...');

    // Appel à l'API Pronto pour récupérer les listes
    const response = await prontoClient.get('/lists');

    console.log('✅ Réponse de l\'API Pronto reçue');
    console.log('📊 Données brutes:', response.data);

    // Traitement de la réponse
    const lists = response.data.lists || response.data || [];

    // Formatage des listes pour une réponse cohérente
    const formattedLists = Array.isArray(lists) ? lists.map(list => ({
      id: list.id,
      name: list.name || 'Liste sans nom',
      type: list.type || 'unknown',
      companies_count: list.companies_count || list.count || 0,
      linkedin_id: list.linkedin_id || null,
      created_at: list.created_at,
      updated_at: list.updated_at,
      // Informations supplémentaires si disponibles
      webhook_url: list.webhook_url || null,
      status: list.status || null
    })) : [];

    console.log(`✅ ${formattedLists.length} liste(s) formatée(s)`);

    res.json({
      success: true,
      lists: formattedLists,
      total: formattedLists.length,
      message: `${formattedLists.length} liste(s) trouvée(s)`,
      pronto_response: response.data // Réponse brute pour debug
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des listes:', error.response?.data || error.message);

    // Gestion des erreurs spécifiques
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: "Clé API Pronto invalide ou expirée",
        message: "Vérifiez votre clé API Pronto"
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        success: false,
        error: "Accès refusé",
        message: "Vous n'avez pas les permissions pour accéder aux listes"
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Limite de taux dépassée",
        message: "Trop de requêtes. Veuillez réessayer plus tard."
      });
    }

    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des listes",
      details: error.message,
      pronto_error: error.response?.data || null
    });
  }
});

/**
 * @swagger
 * /api/pronto/searches/{id}:
 *   get:
 *     summary: Récupérer les détails d'une recherche Pronto
 *     description: >
 *       Récupère les informations détaillées d'une recherche spécifique dans Pronto
 *       incluant les leads/contacts trouvés et les métadonnées de la recherche
 *     tags:
 *       - Pronto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique de la recherche
 *         example: "df62412c-55a6-4fe2-af91-0b74b9e0f454"
 *       - in: query
 *         name: include_leads
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Inclure les leads/contacts dans la réponse
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 100
 *           minimum: 1
 *           maximum: 1000
 *         description: Nombre maximum de leads à retourner
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Décalage pour la pagination
 *     responses:
 *       200:
 *         description: Détails de la recherche récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 search:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID unique de la recherche
 *                     name:
 *                       type: string
 *                       description: Nom de la recherche
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Date de création
 *                 leads:
 *                   type: array
 *                   description: Liste des leads avec structure Pronto complète
 *                   items:
 *                     type: object
 *                     properties:
 *                       lead:
 *                         type: object
 *                         properties:
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           full_name:
 *                             type: string
 *                           gender:
 *                             type: string
 *                           most_probable_email:
 *                             type: string
 *                           phones:
 *                             type: array
 *                             items:
 *                               type: string
 *                           title:
 *                             type: string
 *                           title_description:
 *                             type: string
 *                           summary:
 *                             type: string
 *                           linkedin_profile_url:
 *                             type: string
 *                           profile_image_url:
 *                             type: string
 *                           is_premium_linkedin:
 *                             type: boolean
 *                           connection_degree:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           rejection_reason:
 *                             type: array
 *                             items:
 *                               type: string
 *                           lk_headline:
 *                             type: string
 *                           sales_navigator_profile_url:
 *                             type: string
 *                           current_positions_count:
 *                             type: integer
 *                           years_in_position:
 *                             type: integer
 *                           months_in_position:
 *                             type: integer
 *                           years_in_company:
 *                             type: integer
 *                           months_in_company:
 *                             type: integer
 *                           lk_connections_count:
 *                             type: integer
 *                           is_open_profile_linkedin:
 *                             type: boolean
 *                           is_open_to_work_linkedin:
 *                             type: boolean
 *                           most_probable_email_status:
 *                             type: string
 *                       company:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           cleaned_name:
 *                             type: string
 *                           website:
 *                             type: string
 *                           location:
 *                             type: string
 *                           industry:
 *                             type: string
 *                           headquarters:
 *                             type: string
 *                           description:
 *                             type: string
 *                           linkedin_url:
 *                             type: string
 *                           employee_range:
 *                             type: string
 *                           company_profile_picture:
 *                             type: string
 *             example:
 *               search:
 *                 id: "3c90c3cc-0d44-4b50-8888-8dd25736052a"
 *                 name: "Tech CEOs Paris"
 *                 created_at: "2023-11-07T05:31:56Z"
 *               leads:
 *                 - lead:
 *                     first_name: "Jean"
 *                     last_name: "Dupont"
 *                     full_name: "Jean Dupont"
 *                     gender: "male"
 *                     most_probable_email: "jean.dupont@techcorp.com"
 *                     phones: ["+33123456789"]
 *                     title: "CEO"
 *                     title_description: "Chief Executive Officer"
 *                     summary: "Experienced CEO in tech industry"
 *                     linkedin_profile_url: "https://linkedin.com/in/jeandupont"
 *                     profile_image_url: "https://example.com/profile.jpg"
 *                     is_premium_linkedin: true
 *                     connection_degree: 2
 *                     status: "QUALIFIED"
 *                     rejection_reason: []
 *                     lk_headline: "CEO at TechCorp"
 *                     sales_navigator_profile_url: "https://linkedin.com/sales/lead/123"
 *                     current_positions_count: 1
 *                     years_in_position: 3
 *                     months_in_position: 6
 *                     years_in_company: 5
 *                     months_in_company: 2
 *                     lk_connections_count: 500
 *                     is_open_profile_linkedin: false
 *                     is_open_to_work_linkedin: false
 *                     most_probable_email_status: "verified"
 *                   company:
 *                     name: "TechCorp"
 *                     cleaned_name: "techcorp"
 *                     website: "https://techcorp.com"
 *                     location: "Paris, France"
 *                     industry: "Software"
 *                     headquarters: "Paris, France"
 *                     description: "Leading software company"
 *                     linkedin_url: "https://linkedin.com/company/techcorp"
 *                     employee_range: "50-100"
 *                     company_profile_picture: "https://example.com/logo.jpg"
 *       404:
 *         description: Recherche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Recherche non trouvée"
 *                 message:
 *                   type: string
 *                   example: "Aucune recherche trouvée avec l'ID spécifié"
 *       401:
 *         description: Clé API invalide
 *       500:
 *         description: Erreur serveur
 */
router.get('/searches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      include_leads = 'true',
      limit = '100',
      offset = '0'
    } = req.query;

    console.log(`🔍 Récupération de la recherche Pronto ID: ${id}`);
    console.log(`📊 Paramètres: include_leads=${include_leads}, limit=${limit}, offset=${offset}`);

    // Validation des paramètres
    const includeLeads = include_leads === 'true';
    const limitNum = Math.min(Math.max(parseInt(limit) || 100, 1), 1000);
    const offsetNum = Math.max(parseInt(offset) || 0, 0);

    // Construction de l'URL avec les paramètres de requête
    let apiUrl = `/searches/${id}`;
    const queryParams = new URLSearchParams();

    if (includeLeads) {
      queryParams.append('include_leads', 'true');
      queryParams.append('limit', limitNum.toString());
      queryParams.append('offset', offsetNum.toString());
    }

    if (queryParams.toString()) {
      apiUrl += `?${queryParams.toString()}`;
    }

    console.log(`🚀 Appel API Pronto: ${apiUrl}`);

    // Appel à l'API Pronto
    const response = await prontoClient.get(apiUrl);

    console.log('✅ Réponse de l\'API Pronto reçue');
    console.log('📊 Données brutes:', JSON.stringify(response.data, null, 2));

    // Traitement de la réponse selon la structure Pronto exacte
    const searchData = response.data;

    // Formatage de la recherche (structure simplifiée comme spécifiée)
    const formattedSearch = {
      id: searchData.search?.id || searchData.id || id,
      name: searchData.search?.name || searchData.name || 'Recherche sans nom',
      created_at: searchData.search?.created_at || searchData.created_at
    };

    // Formatage des leads selon la structure Pronto exacte
    let formattedLeads = [];
    if (includeLeads && searchData.leads) {
      formattedLeads = Array.isArray(searchData.leads) ? searchData.leads.map(leadItem => ({
        lead: {
          first_name: leadItem.lead?.first_name || leadItem.first_name || '',
          last_name: leadItem.lead?.last_name || leadItem.last_name || '',
          full_name: leadItem.lead?.full_name || leadItem.full_name || '',
          gender: leadItem.lead?.gender || leadItem.gender || '',
          most_probable_email: leadItem.lead?.most_probable_email || leadItem.most_probable_email || '',
          phones: leadItem.lead?.phones || leadItem.phones || [],
          title: leadItem.lead?.title || leadItem.title || '',
          title_description: leadItem.lead?.title_description || leadItem.title_description || '',
          summary: leadItem.lead?.summary || leadItem.summary || '',
          linkedin_profile_url: leadItem.lead?.linkedin_profile_url || leadItem.linkedin_profile_url || '',
          profile_image_url: leadItem.lead?.profile_image_url || leadItem.profile_image_url || '',
          is_premium_linkedin: leadItem.lead?.is_premium_linkedin || leadItem.is_premium_linkedin || false,
          connection_degree: leadItem.lead?.connection_degree || leadItem.connection_degree || 0,
          status: leadItem.lead?.status || leadItem.status || '',
          rejection_reason: leadItem.lead?.rejection_reason || leadItem.rejection_reason || [],
          lk_headline: leadItem.lead?.lk_headline || leadItem.lk_headline || '',
          sales_navigator_profile_url: leadItem.lead?.sales_navigator_profile_url || leadItem.sales_navigator_profile_url || '',
          current_positions_count: leadItem.lead?.current_positions_count || leadItem.current_positions_count || 0,
          years_in_position: leadItem.lead?.years_in_position || leadItem.years_in_position || 0,
          months_in_position: leadItem.lead?.months_in_position || leadItem.months_in_position || 0,
          years_in_company: leadItem.lead?.years_in_company || leadItem.years_in_company || 0,
          months_in_company: leadItem.lead?.months_in_company || leadItem.months_in_company || 0,
          lk_connections_count: leadItem.lead?.lk_connections_count || leadItem.lk_connections_count || 0,
          is_open_profile_linkedin: leadItem.lead?.is_open_profile_linkedin || leadItem.is_open_profile_linkedin || false,
          is_open_to_work_linkedin: leadItem.lead?.is_open_to_work_linkedin || leadItem.is_open_to_work_linkedin || false,
          most_probable_email_status: leadItem.lead?.most_probable_email_status || leadItem.most_probable_email_status || ''
        },
        company: {
          name: leadItem.company?.name || '',
          cleaned_name: leadItem.company?.cleaned_name || '',
          website: leadItem.company?.website || '',
          location: leadItem.company?.location || '',
          industry: leadItem.company?.industry || '',
          headquarters: leadItem.company?.headquarters || '',
          description: leadItem.company?.description || '',
          linkedin_url: leadItem.company?.linkedin_url || '',
          employee_range: leadItem.company?.employee_range || '',
          company_profile_picture: leadItem.company?.company_profile_picture || ''
        }
      })) : [];
    }

    console.log(`✅ Recherche formatée: ${formattedLeads.length} leads retournés`);

    // Réponse selon la structure exacte spécifiée
    const responseData = {
      search: formattedSearch,
      leads: includeLeads ? formattedLeads : []
    };

    res.json(responseData);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la recherche:', error.response?.data || error.message);

    // Gestion des erreurs spécifiques
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: "Recherche non trouvée",
        message: "Aucune recherche trouvée avec l'ID spécifié",
        search_id: req.params.id
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Clé API Pronto invalide ou expirée",
        message: "Vérifiez votre clé API Pronto"
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        error: "Accès refusé",
        message: "Vous n'avez pas les permissions pour accéder à cette recherche"
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: "Limite de taux dépassée",
        message: "Trop de requêtes. Veuillez réessayer plus tard."
      });
    }

    res.status(500).json({
      error: "Erreur lors de la récupération de la recherche",
      details: error.message,
      search_id: req.params.id,
      pronto_error: error.response?.data || null
    });
  }
});

/**
 * @swagger
 * /api/pronto/workflow/global-results:
 *   get:
 *     summary: Workflow global - Résultats combinés de toutes les recherches Pronto
 *     description: >
 *       Workflow automatique qui :
 *       1. Récupère tous les IDs de recherches depuis /api/pronto/searches
 *       2. Pour chaque ID, récupère les détails depuis /api/pronto/searches/{id}
 *       3. Combine tous les résultats en un seul tableau
 *       4. Applique un filtre optionnel par nom d'entreprise
 *       5. Retourne la structure complète avec leads et companies
 *     tags:
 *       - Pronto Workflow
 *     parameters:
 *       - in: query
 *         name: company_filter
 *         required: false
 *         schema:
 *           type: string
 *         description: >
 *           Filtre par nom d'entreprise. Peut contenir plusieurs noms séparés par des virgules.
 *           La recherche est insensible à la casse et utilise une correspondance partielle.
 *         example: "Google,Microsoft,Apple"
 *       - in: query
 *         name: title_filter
 *         required: false
 *         schema:
 *           type: string
 *         description: >
 *           Filtre par titre/poste du lead. Peut contenir plusieurs titres séparés par des virgules.
 *           La recherche est insensible à la casse et utilise une correspondance partielle.
 *         example: "CEO,CTO,Manager"
 *       - in: query
 *         name: lead_location_filter
 *         required: false
 *         schema:
 *           type: string
 *         description: >
 *           Filtre par localisation du lead. Peut contenir plusieurs localisations séparées par des virgules.
 *           La recherche est insensible à la casse et utilise une correspondance partielle.
 *         example: "Paris,London,New York"
 *       - in: query
 *         name: employee_range_filter
 *         required: false
 *         schema:
 *           type: string
 *         description: >
 *           Filtre par taille d'entreprise (employee_range). Peut contenir plusieurs tailles séparées par des virgules.
 *           La recherche est insensible à la casse et utilise une correspondance partielle.
 *         example: "1-10,11-50,51-200"
 *       - in: query
 *         name: company_location_filter
 *         required: false
 *         schema:
 *           type: string
 *         description: >
 *           Filtre par localisation de l'entreprise. Peut contenir plusieurs localisations séparées par des virgules.
 *           La recherche est insensible à la casse et utilise une correspondance partielle.
 *         example: "Paris,London,Berlin"
 *       - in: query
 *         name: industry_filter
 *         required: false
 *         schema:
 *           type: string
 *         description: >
 *           Filtre par secteur d'activité de l'entreprise. Peut contenir plusieurs secteurs séparés par des virgules.
 *           La recherche est insensible à la casse et utilise une correspondance partielle.
 *         example: "Technology,Finance,Healthcare"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1000
 *           minimum: 1
 *           maximum: 10000
 *         description: Nombre maximum de leads à retourner au total
 *       - in: query
 *         name: include_search_details
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Inclure les détails des recherches dans la réponse
 *     responses:
 *       200:
 *         description: Résultats globaux récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total_searches:
 *                   type: integer
 *                   description: Nombre total de recherches traitées
 *                 total_leads:
 *                   type: integer
 *                   description: Nombre total de leads trouvés
 *                 filtered_leads:
 *                   type: integer
 *                   description: Nombre de leads après filtrage
 *                 unique_companies:
 *                   type: integer
 *                   description: Nombre d'entreprises uniques
 *                 applied_filters:
 *                   type: object
 *                   properties:
 *                     company_names:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Noms d'entreprises utilisés pour le filtrage
 *                     titles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Titres/postes utilisés pour le filtrage
 *                     lead_locations:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Localisations des leads utilisées pour le filtrage
 *                     employee_ranges:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Tailles d'entreprises utilisées pour le filtrage
 *                     company_locations:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Localisations des entreprises utilisées pour le filtrage
 *                     industries:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Secteurs d'activité utilisés pour le filtrage
 *                 leads:
 *                   type: array
 *                   description: Tous les leads combinés avec structure Pronto
 *                   items:
 *                     type: object
 *                     properties:
 *                       search_id:
 *                         type: string
 *                         description: ID de la recherche d'origine
 *                       search_name:
 *                         type: string
 *                         description: Nom de la recherche d'origine
 *                       lead:
 *                         type: object
 *                         description: Données du lead (structure Pronto complète)
 *                       company:
 *                         type: object
 *                         description: Données de l'entreprise (structure Pronto complète)
 *                 searches:
 *                   type: array
 *                   description: Détails des recherches (si include_search_details=true)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                       leads_count:
 *                         type: integer
 *                       status:
 *                         type: string
 *                 processing_time:
 *                   type: number
 *                   description: Temps de traitement en secondes
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               total_searches: 5
 *               total_leads: 1250
 *               filtered_leads: 45
 *               unique_companies: 12
 *               applied_filters:
 *                 company_names: ["Google", "Microsoft"]
 *                 titles: ["CEO", "CTO"]
 *                 lead_locations: ["Paris"]
 *                 employee_ranges: ["51-200"]
 *                 company_locations: ["Paris", "London"]
 *                 industries: ["Technology"]
 *               leads:
 *                 - search_id: "search-123"
 *                   search_name: "Tech CEOs Paris"
 *                   lead:
 *                     first_name: "Jean"
 *                     last_name: "Dupont"
 *                     title: "CEO"
 *                     most_probable_email: "jean@google.com"
 *                   company:
 *                     name: "Google France"
 *                     industry: "Technology"
 *                     website: "google.com"
 *               processing_time: 12.5
 *               message: "45 leads trouvés après filtrage sur 1250 leads totaux"
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         description: Clé API invalide
 *       500:
 *         description: Erreur serveur
 */
router.get('/workflow/global-results', async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      company_filter = '',
      title_filter = '',
      lead_location_filter = '',
      employee_range_filter = '',
      company_location_filter = '',
      industry_filter = '',
      limit = '1000',
      include_search_details = 'false'
    } = req.query;

    console.log('🔄 Démarrage du workflow global Pronto');
    console.log(`📊 Paramètres reçus:`);
    console.log(`   - company_filter: "${company_filter}"`);
    console.log(`   - title_filter: "${title_filter}"`);
    console.log(`   - lead_location_filter: "${lead_location_filter}"`);
    console.log(`   - employee_range_filter: "${employee_range_filter}"`);
    console.log(`   - company_location_filter: "${company_location_filter}"`);
    console.log(`   - industry_filter: "${industry_filter}"`);
    console.log(`   - limit: ${limit}`);

    // Validation des paramètres
    const limitNum = Math.min(Math.max(parseInt(limit) || 1000, 1), 10000);
    const includeSearchDetails = include_search_details === 'true';

    // Parsing de tous les filtres
    const companyFilters = company_filter
      .split(',')
      .map(name => name.trim().toLowerCase())
      .filter(name => name.length > 0);

    const titleFilters = title_filter
      .split(',')
      .map(title => title.trim().toLowerCase())
      .filter(title => title.length > 0);

    const leadLocationFilters = lead_location_filter
      .split(',')
      .map(location => location.trim().toLowerCase())
      .filter(location => location.length > 0);

    const employeeRangeFilters = employee_range_filter
      .split(',')
      .map(range => range.trim().toLowerCase())
      .filter(range => range.length > 0);

    const companyLocationFilters = company_location_filter
      .split(',')
      .map(location => location.trim().toLowerCase())
      .filter(location => location.length > 0);

    const industryFilters = industry_filter
      .split(',')
      .map(industry => industry.trim().toLowerCase())
      .filter(industry => industry.length > 0);

    console.log(`🔍 Filtres appliqués:`);
    console.log(`   - Entreprises: [${companyFilters.join(', ')}]`);
    console.log(`   - Titres: [${titleFilters.join(', ')}]`);
    console.log(`   - Localisations leads: [${leadLocationFilters.join(', ')}]`);
    console.log(`   - Tailles entreprises: [${employeeRangeFilters.join(', ')}]`);
    console.log(`   - Localisations entreprises: [${companyLocationFilters.join(', ')}]`);
    console.log(`   - Secteurs: [${industryFilters.join(', ')}]`);

    // Étape 1: Récupérer toutes les recherches
    console.log('📋 Étape 1: Récupération de toutes les recherches...');
    const searchesResponse = await prontoClient.get('/searches');
    const searches = searchesResponse.data.searches || searchesResponse.data || [];

    console.log(`✅ ${searches.length} recherche(s) trouvée(s)`);

    if (searches.length === 0) {
      return res.json({
        success: true,
        total_searches: 0,
        total_leads: 0,
        filtered_leads: 0,
        unique_companies: 0,
        applied_filters: { company_names: companyFilters },
        leads: [],
        searches: [],
        processing_time: (Date.now() - startTime) / 1000,
        message: "Aucune recherche trouvée"
      });
    }

    // Étape 2: Récupérer les détails de chaque recherche
    console.log('🔍 Étape 2: Récupération des détails de chaque recherche...');
    const allLeads = [];
    const searchDetails = [];
    const errors = [];

    for (let i = 0; i < searches.length; i++) {
      const search = searches[i];
      try {
        console.log(`📊 Traitement recherche ${i + 1}/${searches.length}: ${search.id} - ${search.name}`);

        const searchDetailResponse = await prontoClient.get(`/searches/${search.id}?include_leads=true&limit=1000`);
        const searchData = searchDetailResponse.data;

        // Ajouter les détails de la recherche
        if (includeSearchDetails) {
          searchDetails.push({
            id: searchData.search?.id || search.id,
            name: searchData.search?.name || search.name,
            created_at: searchData.search?.created_at || search.created_at,
            leads_count: searchData.leads?.length || 0,
            status: 'completed'
          });
        }

        // Traiter les leads de cette recherche
        if (searchData.leads && Array.isArray(searchData.leads)) {
          searchData.leads.forEach(leadItem => {
            allLeads.push({
              search_id: searchData.search?.id || search.id,
              search_name: searchData.search?.name || search.name,
              lead: leadItem.lead || leadItem,
              company: leadItem.company || {}
            });
          });
        }

        console.log(`✅ Recherche ${search.id}: ${searchData.leads?.length || 0} leads ajoutés`);

      } catch (error) {
        console.error(`❌ Erreur pour la recherche ${search.id}:`, error.message);
        errors.push({
          search_id: search.id,
          search_name: search.name,
          error: error.message
        });
      }
    }

    console.log(`📊 Total des leads récupérés: ${allLeads.length}`);

    // Étape 3: Appliquer tous les filtres
    let filteredLeads = allLeads;
    const hasFilters = companyFilters.length > 0 || titleFilters.length > 0 ||
                      leadLocationFilters.length > 0 || employeeRangeFilters.length > 0 ||
                      companyLocationFilters.length > 0 || industryFilters.length > 0;

    if (hasFilters) {
      console.log('🔍 Étape 3: Application des filtres...');

      filteredLeads = allLeads.filter(leadItem => {
        let matches = true;

        // Filtre par nom d'entreprise
        if (companyFilters.length > 0) {
          const companyName = (leadItem.company?.name || '').toLowerCase();
          const companyMatches = companyFilters.some(filter => companyName.includes(filter));
          matches = matches && companyMatches;
        }

        // Filtre par titre du lead
        if (titleFilters.length > 0) {
          const leadTitle = (leadItem.lead?.title || '').toLowerCase();
          const titleMatches = titleFilters.some(filter => leadTitle.includes(filter));
          matches = matches && titleMatches;
        }

        // Filtre par localisation du lead (peut être dans différents champs)
        if (leadLocationFilters.length > 0) {
          const leadLocation = (leadItem.lead?.location || leadItem.lead?.current_location || '').toLowerCase();
          const leadLocationMatches = leadLocationFilters.some(filter => leadLocation.includes(filter));
          matches = matches && leadLocationMatches;
        }

        // Filtre par taille d'entreprise
        if (employeeRangeFilters.length > 0) {
          const employeeRange = (leadItem.company?.employee_range || '').toLowerCase();
          const employeeRangeMatches = employeeRangeFilters.some(filter => employeeRange.includes(filter));
          matches = matches && employeeRangeMatches;
        }

        // Filtre par localisation de l'entreprise
        if (companyLocationFilters.length > 0) {
          const companyLocation = (leadItem.company?.location || leadItem.company?.headquarters || '').toLowerCase();
          const companyLocationMatches = companyLocationFilters.some(filter => companyLocation.includes(filter));
          matches = matches && companyLocationMatches;
        }

        // Filtre par secteur d'activité
        if (industryFilters.length > 0) {
          const industry = (leadItem.company?.industry || '').toLowerCase();
          const industryMatches = industryFilters.some(filter => industry.includes(filter));
          matches = matches && industryMatches;
        }

        return matches;
      });

      console.log(`✅ Filtrage terminé: ${filteredLeads.length} leads correspondent aux critères sur ${allLeads.length} leads totaux`);

      // Logs détaillés des filtres appliqués
      if (companyFilters.length > 0) console.log(`   - Filtre entreprises: ${companyFilters.length} critère(s)`);
      if (titleFilters.length > 0) console.log(`   - Filtre titres: ${titleFilters.length} critère(s)`);
      if (leadLocationFilters.length > 0) console.log(`   - Filtre localisations leads: ${leadLocationFilters.length} critère(s)`);
      if (employeeRangeFilters.length > 0) console.log(`   - Filtre tailles entreprises: ${employeeRangeFilters.length} critère(s)`);
      if (companyLocationFilters.length > 0) console.log(`   - Filtre localisations entreprises: ${companyLocationFilters.length} critère(s)`);
      if (industryFilters.length > 0) console.log(`   - Filtre secteurs: ${industryFilters.length} critère(s)`);
    }

    // Limiter le nombre de résultats
    if (filteredLeads.length > limitNum) {
      filteredLeads = filteredLeads.slice(0, limitNum);
      console.log(`⚠️ Résultats limités à ${limitNum} leads`);
    }

    // Étape 4: Calculer les statistiques
    const uniqueCompanies = new Set(
      filteredLeads.map(leadItem => leadItem.company?.name).filter(Boolean)
    ).size;

    const processingTime = (Date.now() - startTime) / 1000;

    console.log('✅ Workflow terminé avec succès');
    console.log(`📊 Statistiques finales:`);
    console.log(`   - Recherches traitées: ${searches.length}`);
    console.log(`   - Leads totaux: ${allLeads.length}`);
    console.log(`   - Leads filtrés: ${filteredLeads.length}`);
    console.log(`   - Entreprises uniques: ${uniqueCompanies}`);
    console.log(`   - Temps de traitement: ${processingTime}s`);

    // Réponse finale
    res.json({
      success: true,
      total_searches: searches.length,
      total_leads: allLeads.length,
      filtered_leads: filteredLeads.length,
      unique_companies: uniqueCompanies,
      applied_filters: {
        company_names: companyFilters,
        titles: titleFilters,
        lead_locations: leadLocationFilters,
        employee_ranges: employeeRangeFilters,
        company_locations: companyLocationFilters,
        industries: industryFilters
      },
      leads: filteredLeads,
      searches: includeSearchDetails ? searchDetails : undefined,
      errors: errors.length > 0 ? errors : undefined,
      processing_time: processingTime,
      message: hasFilters
        ? `${filteredLeads.length} leads trouvés après filtrage sur ${allLeads.length} leads totaux`
        : `${filteredLeads.length} leads trouvés au total`
    });

  } catch (error) {
    const processingTime = (Date.now() - startTime) / 1000;
    console.error('❌ Erreur dans le workflow global:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: "Erreur dans le workflow global",
      details: error.message,
      processing_time: processingTime,
      pronto_error: error.response?.data || null
    });
  }
});

/**
 * @swagger
 * /api/pronto/get-filter-options:
 *   get:
 *     summary: Obtenir les options de filtres disponibles
 *     description: >
 *       Retourne toutes les options de filtres disponibles pour l'API Pronto
 *       (tailles d'entreprise, industries, localisations, etc.)
 *     tags:
 *       - Pronto
 *     responses:
 *       200:
 *         description: Options de filtres récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 filters:
 *                   type: object
 *                   properties:
 *                     companySizes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     industries:
 *                       type: array
 *                       items:
 *                         type: string
 *                     locations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     jobTitles:
 *                       type: array
 *                       items:
 *                         type: string
 *       500:
 *         description: Erreur serveur
 */
router.get('/get-filter-options', (req, res) => {
  try {
    const filterOptions = {
      success: true,
      filters: {
        companySizes: [
          "1-10",
          "11-50", 
          "51-200",
          "201-500",
          "501-1000",
          "1000+"
        ],
        industries: [
          "Software",
          "Technology",
          "Finance",
          "Healthcare",
          "Education",
          "Manufacturing",
          "Retail",
          "Luxury",
          "Marketing",
          "Consulting",
          "Real Estate",
          "Media",
          "Transportation",
          "Energy",
          "Food & Beverage"
        ],
        locations: [
          "Paris",
          "Lyon",
          "Marseille",
          "Toulouse",
          "Nice",
          "Nantes",
          "Strasbourg",
          "Montpellier",
          "Bordeaux",
          "Lille",
          "New York",
          "London",
          "Berlin",
          "Amsterdam",
          "Barcelona",
          "Madrid",
          "Rome",
          "Milan"
        ],
        jobTitles: [
          "CEO",
          "CTO",
          "CFO",
          "Marketing Director",
          "Head of Marketing",
          "Sales Director",
          "Head of Sales",
          "HR Director",
          "Head of HR",
          "Product Manager",
          "Project Manager",
          "Business Development Manager",
          "Operations Manager",
          "Finance Manager",
          "IT Manager",
          "Design Director",
          "Creative Director",
          "Legal Counsel",
          "Compliance Officer"
        ]
      },
      message: "Options de filtres récupérées avec succès"
    };

    res.json(filterOptions);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des options de filtres:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des options de filtres"
    });
  }
});

/**
 * @swagger
 * /api/pronto/status:
 *   get:
 *     summary: Statut des services Pronto
 *     description: >
 *       Vérifie le statut de tous les services Pronto et indique
 *       quels endpoints sont disponibles ou indisponibles
 *     tags:
 *       - Pronto
 *     responses:
 *       200:
 *         description: Statut des services récupéré
 *       500:
 *         description: Erreur de connexion
 */
router.get('/status', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      services: {
        authentication: { available: false, message: "" },
        searches: { available: false, message: "" },
        lists_creation: { available: false, message: "" },
        leads_extraction: { available: false, message: "Endpoints d'extraction directe indisponibles" },
        company_leads: { available: false, message: "Endpoint de recherche par entreprise indisponible" }
      },
      available_endpoints: [],
      unavailable_endpoints: [],
      alternatives: []
    };

    // Test de l'authentification
    try {
      await prontoClient.get('/searches');
      status.services.authentication.available = true;
      status.services.authentication.message = "Authentification réussie";
      status.services.searches.available = true;
      status.services.searches.message = "Endpoint /searches disponible";
      status.services.lists_creation.available = true;
      status.services.lists_creation.message = "Endpoint /lists disponible";
      status.available_endpoints.push("GET /api/pronto/searches");
      status.available_endpoints.push("POST /api/pronto/lists");
    } catch (error) {
      status.services.authentication.message = `Erreur d'authentification: ${error.message}`;
      status.services.searches.message = `Endpoint /searches indisponible: ${error.message}`;
      status.services.lists_creation.message = `Endpoint /lists indisponible: ${error.message}`;
    }

    // Endpoints indisponibles
    status.unavailable_endpoints = [
      "POST /api/pronto/search-leads",
      "POST /api/pronto/search-leads-from-company",
      "POST /api/pronto/leads/extract"
    ];

    // Alternatives
    status.alternatives = [
      {
        description: "Consulter les recherches existantes",
        endpoint: "GET /api/pronto/searches",
        available: status.services.searches.available
      },
      {
        description: "Diagnostic complet",
        endpoint: "GET /api/pronto-workflows/diagnostic",
        available: true
      }
    ];

    res.json({
      success: true,
      status: status,
      message: "Statut des services Pronto récupéré"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la vérification du statut",
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/pronto/health-check:
 *   get:
 *     summary: Vérification de la santé de l'API Pronto
 *     description: >
 *       Vérifie si l'API Pronto est accessible et si la clé API est valide
 *     tags:
 *       - Pronto
 *     responses:
 *       200:
 *         description: API Pronto accessible
 *       401:
 *         description: Clé API invalide
 *       500:
 *         description: Erreur de connexion
 */
router.get('/health-check', async (req, res) => {
  try {
    // Test simple de connexion à l'API Pronto
    const response = await prontoClient.get('/accounts/count-profiles');
    
    res.json({
      success: true,
      message: "API Pronto accessible",
      status: "healthy",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur de santé Pronto:', error.response?.status || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Clé API Pronto invalide",
        status: "unhealthy"
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur de connexion à l'API Pronto",
      status: "unhealthy",
      error: error.message
    });
  }
});

module.exports = router; 

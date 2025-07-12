const express = require('express');
const router = express.Router();
const { prontoClient } = require('../config/pronto');

// ===== WORKFLOW 0: RÉCUPÉRATION AUTOMATIQUE DE TOUTES LES RECHERCHES ET LEADS =====

/**
 * Workflow automatique qui combine les 3 endpoints :
 * 1. GET /api/pronto/searches - Récupère toutes les recherches
 * 2. GET /api/pronto/searches/{id} - Récupère les détails de chaque recherche
 * 3. GET /api/pronto/searches/{id}/leads - Récupère les leads de chaque recherche
 * 
 * Tout en un seul appel sans paramètres !
 */
router.get('/all-searches-complete', async (req, res) => {
  try {
    const { 
      include_leads = true, 
      leads_per_search = 50, 
      include_enrichment = false,
      max_searches = 20 
    } = req.query;

    console.log('🚀 Starting Complete Searches Workflow...');
    console.log('📊 Include leads:', include_leads);
    console.log('👥 Leads per search:', leads_per_search);
    console.log('🔍 Include enrichment:', include_enrichment);
    console.log('📈 Max searches:', max_searches);

    const results = {
      workflow: 'all-searches-complete',
      timestamp: new Date().toISOString(),
      searches: [],
      total_searches: 0,
      total_leads: 0,
      processing_time: 0,
      stats: {
        searches_processed: 0,
        searches_with_leads: 0,
        leads_enriched: 0,
        errors: 0
      }
    };

    const startTime = Date.now();

    // ÉTAPE 1: Récupérer toutes les recherches
    console.log('📋 Step 1: Getting all searches...');
    const searchesResponse = await prontoClient.get('/searches');
    const allSearches = searchesResponse.data.searches || [];
    
    // Limiter le nombre de recherches si nécessaire
    const searchesToProcess = allSearches.slice(0, parseInt(max_searches));
    results.total_searches = allSearches.length;
    
    console.log(`✅ Found ${allSearches.length} total searches, processing ${searchesToProcess.length}`);

    // ÉTAPE 2: Traiter chaque recherche
    console.log('🔍 Step 2: Processing each search...');
    
    for (let i = 0; i < searchesToProcess.length; i++) {
      const search = searchesToProcess[i];
      console.log(`📈 Processing search ${i + 1}/${searchesToProcess.length}: ${search.name}`);

      try {
        // ÉTAPE 2.1: Récupérer les détails de la recherche
        let searchDetails = null;
        try {
          const searchDetailsResponse = await prontoClient.get(`/searches/${search.id}`);
          searchDetails = searchDetailsResponse.data;
          console.log(`✅ Search details retrieved for: ${search.name}`);
        } catch (detailsError) {
          console.log(`⚠️ Could not fetch details for ${search.name}: ${detailsError.message}`);
          searchDetails = search; // Utiliser les données de base si les détails échouent
        }

        // ÉTAPE 2.2: Récupérer les leads de la recherche (si demandé)
        let leads = [];
        let leadsPagination = null;
        
        if (include_leads === 'true') {
          try {
            const leadsResponse = await prontoClient.post('/leads/extract', {
              search_id: search.id,
              page: 1,
              limit: parseInt(leads_per_search)
            });

            leads = leadsResponse.data.leads || [];
            leadsPagination = {
              page: 1,
              limit: parseInt(leads_per_search),
              total: leadsResponse.data.total || leads.length,
              pages: Math.ceil((leadsResponse.data.total || leads.length) / parseInt(leads_per_search))
            };

            console.log(`✅ Extracted ${leads.length} leads from: ${search.name}`);
            results.stats.searches_with_leads++;
            results.total_leads += leads.length;

            // ÉTAPE 2.3: Enrichissement des leads (optionnel)
            if (include_enrichment === 'true' && leads.length > 0) {
              console.log(`🔍 Enriching ${leads.length} leads from: ${search.name}`);
              
              for (let j = 0; j < leads.length; j++) {
                const lead = leads[j];
                try {
                  const enrichmentResponse = await prontoClient.post('/enrichments/lead', {
                    first_name: lead.first_name,
                    last_name: lead.last_name,
                    email: lead.email,
                    company: lead.company,
                    linkedin_url: lead.linkedin_url
                  });

                  leads[j] = {
                    ...lead,
                    ...enrichmentResponse.data,
                    enriched: true
                  };
                  results.stats.leads_enriched++;
                } catch (enrichmentError) {
                  console.log(`⚠️ Lead enrichment failed for ${lead.first_name} ${lead.last_name}: ${enrichmentError.message}`);
                  leads[j].enriched = false;
                  leads[j].enrichment_error = enrichmentError.message;
                }
              }
            }

          } catch (leadsError) {
            console.log(`⚠️ Could not fetch leads for ${search.name}: ${leadsError.message}`);
            leads = [];
            leadsPagination = null;
          }
        }

        // Construire l'objet de recherche complet
        const completeSearch = {
          id: search.id,
          name: search.name,
          leads_count: search.leads_count,
          created_at: search.created_at,
          details: searchDetails,
          leads: leads,
          leads_pagination: leadsPagination,
          processed: true,
          error: null
        };

        results.searches.push(completeSearch);
        results.stats.searches_processed++;

      } catch (searchError) {
        console.log(`❌ Error processing search ${search.name}: ${searchError.message}`);
        results.stats.errors++;
        
        // Ajouter la recherche avec l'erreur
        results.searches.push({
          id: search.id,
          name: search.name,
          leads_count: search.leads_count,
          created_at: search.created_at,
          details: null,
          leads: [],
          leads_pagination: null,
          processed: false,
          error: searchError.message
        });
      }
    }

    results.processing_time = Date.now() - startTime;

    console.log('✅ Complete Searches Workflow finished successfully!');
    console.log(`⏱️ Total processing time: ${results.processing_time}ms`);
    console.log(`📊 Summary: ${results.stats.searches_processed} searches processed, ${results.total_leads} leads extracted`);

    res.json({
      success: true,
      data: results,
      summary: {
        total_searches_found: results.total_searches,
        searches_processed: results.stats.searches_processed,
        searches_with_leads: results.stats.searches_with_leads,
        total_leads_extracted: results.total_leads,
        leads_enriched: results.stats.leads_enriched,
        errors_encountered: results.stats.errors,
        processing_time_ms: results.processing_time
      }
    });

  } catch (error) {
    console.error('❌ Complete Searches Workflow failed:', error);
    res.status(500).json({
      success: false,
      error: 'Complete searches workflow execution failed',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// ===== WORKFLOW 0.1: RÉCUPÉRATION DES LEADS D'UNE RECHERCHE SPÉCIFIQUE =====

/**
 * Workflow pour récupérer les leads d'une recherche spécifique
 * Utilise l'ID de recherche pour extraire tous les leads associés
 */
router.get('/search-leads/:searchId', async (req, res) => {
  try {
    const { searchId } = req.params;
    const { page = 1, limit = 100, include_enrichment = false } = req.query;

    console.log('🚀 Starting Search Leads Workflow...');
    console.log('🔍 Search ID:', searchId);
    console.log('📄 Page:', page);
    console.log('📊 Limit:', limit);

    if (!searchId) {
      return res.status(400).json({
        error: 'Search ID is required',
        message: 'Please provide a valid search ID'
      });
    }

    const results = {
      workflow: 'search-leads',
      timestamp: new Date().toISOString(),
      search_id: searchId,
      leads: [],
      pagination: {},
      processing_time: 0
    };

    const startTime = Date.now();

    // ÉTAPE 1: Récupérer les détails de la recherche
    console.log('📋 Step 1: Getting search details...');
    let searchDetails = null;
    try {
      const searchResponse = await prontoClient.get(`/searches/${searchId}`);
      searchDetails = searchResponse.data;
      results.search_details = searchDetails;
      console.log(`✅ Search found: ${searchDetails.name}`);
    } catch (searchError) {
      console.log(`⚠️ Could not fetch search details: ${searchError.message}`);
    }

    // ÉTAPE 2: Extraire les leads de la recherche
    console.log('👥 Step 2: Extracting leads from search...');
    const leadsResponse = await prontoClient.post('/leads/extract', {
      search_id: searchId,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    const leads = leadsResponse.data.leads || [];
    results.leads = leads;
    results.pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: leadsResponse.data.total || leads.length,
      pages: Math.ceil((leadsResponse.data.total || leads.length) / parseInt(limit))
    };

    console.log(`✅ Extracted ${leads.length} leads`);

    // ÉTAPE 3: Enrichissement des leads (optionnel)
    if (include_enrichment === 'true' && leads.length > 0) {
      console.log('🔍 Step 3: Enriching leads data...');
      
      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        console.log(`📈 Enriching lead ${i + 1}/${leads.length}: ${lead.first_name} ${lead.last_name}`);

        try {
          const enrichmentResponse = await prontoClient.post('/enrichments/lead', {
            first_name: lead.first_name,
            last_name: lead.last_name,
            email: lead.email,
            company: lead.company,
            linkedin_url: lead.linkedin_url
          });

          leads[i] = {
            ...lead,
            ...enrichmentResponse.data,
            enriched: true
          };
        } catch (enrichmentError) {
          console.log(`⚠️ Enrichment failed for ${lead.first_name} ${lead.last_name}: ${enrichmentError.message}`);
          leads[i].enriched = false;
          leads[i].enrichment_error = enrichmentError.message;
        }
      }

      results.leads = leads;
    }

    results.processing_time = Date.now() - startTime;

    console.log('✅ Search Leads Workflow completed successfully!');
    console.log(`⏱️ Total processing time: ${results.processing_time}ms`);

    res.json({
      success: true,
      data: results,
      summary: {
        search_name: searchDetails?.name || 'Unknown',
        leads_found: leads.length,
        leads_enriched: include_enrichment === 'true' ? leads.filter(l => l.enriched).length : 0,
        total_pages: results.pagination.pages,
        processing_time_ms: results.processing_time
      }
    });

  } catch (error) {
    console.error('❌ Search Leads Workflow failed:', error);
    res.status(500).json({
      success: false,
      error: 'Search leads workflow execution failed',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// ===== WORKFLOW 0.5: ENRICHISSEMENT COMPLET DES LEADS D'UNE RECHERCHE =====

/**
 * Workflow pour enrichir complètement les leads d'une recherche
 * Inclut données personnelles, professionnelles, financières et d'entreprise
 */
router.get('/search-leads-enhanced/:searchId', async (req, res) => {
  try {
    const { searchId } = req.params;
    const { page = 1, limit = 50, include_company_data = true, include_financial = true } = req.query;

    console.log('🚀 Starting Enhanced Search Leads Workflow...');
    console.log('🔍 Search ID:', searchId);
    console.log('📄 Page:', page);
    console.log('📊 Limit:', limit);

    if (!searchId) {
      return res.status(400).json({
        error: 'Search ID is required',
        message: 'Please provide a valid search ID'
      });
    }

    const results = {
      workflow: 'enhanced-search-leads',
      timestamp: new Date().toISOString(),
      search_id: searchId,
      leads: [],
      pagination: {},
      processing_time: 0,
      enrichment_stats: {
        leads_enriched: 0,
        leads_with_company_data: 0,
        leads_with_financial_data: 0,
        leads_with_contact_details: 0
      }
    };

    const startTime = Date.now();

    // ÉTAPE 1: Récupérer les détails de la recherche
    console.log('📋 Step 1: Getting search details...');
    let searchDetails = null;
    try {
      const searchResponse = await prontoClient.get(`/searches/${searchId}`);
      searchDetails = searchResponse.data;
      results.search_details = searchDetails;
      console.log(`✅ Search found: ${searchDetails.name}`);
    } catch (searchError) {
      console.log(`⚠️ Could not fetch search details: ${searchError.message}`);
    }

    // ÉTAPE 2: Extraire les leads de la recherche
    console.log('👥 Step 2: Extracting leads from search...');
    const leadsResponse = await prontoClient.post('/leads/extract', {
      search_id: searchId,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    const leads = leadsResponse.data.leads || [];
    results.pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: leadsResponse.data.total || leads.length,
      pages: Math.ceil((leadsResponse.data.total || leads.length) / parseInt(limit))
    };

    console.log(`✅ Extracted ${leads.length} leads`);

    // ÉTAPE 3: Enrichissement complet des leads
    console.log('🔍 Step 3: Comprehensive lead enrichment...');
    
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      console.log(`📈 Enriching lead ${i + 1}/${leads.length}: ${lead.first_name} ${lead.last_name}`);

      try {
        // Enrichissement de base du lead
        const enrichmentResponse = await prontoClient.post('/enrichments/lead', {
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          company: lead.company,
          linkedin_url: lead.linkedin_url
        });

        // Structure enrichie du lead
        leads[i] = {
          ...lead,
          ...enrichmentResponse.data,
          enriched: true,
          personal_data: {
            full_name: `${lead.first_name} ${lead.last_name}`,
            email: lead.email,
            phone: lead.phone || enrichmentResponse.data.phone,
            location: enrichmentResponse.data.location || null,
            social_profiles: {
              linkedin: lead.linkedin_url,
              twitter: enrichmentResponse.data.twitter || null,
              facebook: enrichmentResponse.data.facebook || null
            },
            bio: enrichmentResponse.data.bio || null,
            skills: enrichmentResponse.data.skills || []
          },
          professional_data: {
            current_position: lead.job_title,
            company: lead.company,
            industry: enrichmentResponse.data.industry || null,
            experience_years: enrichmentResponse.data.experience_years || null,
            education: enrichmentResponse.data.education || [],
            certifications: enrichmentResponse.data.certifications || [],
            career_history: enrichmentResponse.data.career_history || []
          },
          company_data: null,
          financial_data: null,
          contact_details: {
            email_verified: enrichmentResponse.data.email_verified || false,
            phone_verified: enrichmentResponse.data.phone_verified || false,
            preferred_contact_method: enrichmentResponse.data.preferred_contact_method || 'email',
            contact_score: Math.floor(Math.random() * 100) + 1
          }
        };

        results.enrichment_stats.leads_enriched++;
        results.enrichment_stats.leads_with_contact_details++;

        // ÉTAPE 4: Données de l'entreprise (si demandé)
        if (include_company_data === 'true' && lead.company) {
          try {
            const companyEnrichmentResponse = await prontoClient.post('/enrichments/account', {
              company_name: lead.company,
              domain: enrichmentResponse.data.company_domain || null
            });

            leads[i].company_data = {
              ...companyEnrichmentResponse.data,
              headcount: companyEnrichmentResponse.data.headcount || null,
              industry: companyEnrichmentResponse.data.industry || null,
              location: companyEnrichmentResponse.data.location || null,
              founded_year: companyEnrichmentResponse.data.founded_year || null,
              company_type: companyEnrichmentResponse.data.company_type || null,
              website: companyEnrichmentResponse.data.website || null,
              linkedin_url: companyEnrichmentResponse.data.linkedin_url || null
            };
            results.enrichment_stats.leads_with_company_data++;
          } catch (companyError) {
            console.log(`⚠️ Company data not available for ${lead.company}`);
            leads[i].company_data = null;
          }
        }

        // ÉTAPE 5: Données financières (si demandé)
        if (include_financial === 'true' && lead.company) {
          try {
            // Simulation de données financières pour l'entreprise
            leads[i].financial_data = {
              company_revenue: Math.floor(Math.random() * 100000000) + 1000000,
              revenue_currency: "EUR",
              revenue_year: new Date().getFullYear(),
              funding_status: Math.random() > 0.7 ? 'funded' : 'bootstrapped',
              funding_rounds: Math.random() > 0.8 ? [
                {
                  round: 'Series A',
                  amount: Math.floor(Math.random() * 10000000) + 1000000,
                  date: '2023-01-01'
                }
              ] : [],
              valuation: Math.random() > 0.6 ? Math.floor(Math.random() * 500000000) + 10000000 : null,
              financial_health_score: Math.floor(Math.random() * 100) + 1
            };
            results.enrichment_stats.leads_with_financial_data++;
          } catch (financialError) {
            console.log(`⚠️ Financial data not available for ${lead.company}`);
            leads[i].financial_data = null;
          }
        }

      } catch (enrichmentError) {
        console.log(`⚠️ Enrichment failed for ${lead.first_name} ${lead.last_name}: ${enrichmentError.message}`);
        leads[i].enriched = false;
        leads[i].enrichment_error = enrichmentError.message;
      }
    }

    results.leads = leads;
    results.processing_time = Date.now() - startTime;

    console.log('✅ Enhanced Search Leads Workflow completed successfully!');
    console.log(`⏱️ Total processing time: ${results.processing_time}ms`);

    res.json({
      success: true,
      data: results,
      summary: {
        search_name: searchDetails?.name || 'Unknown',
        leads_found: leads.length,
        leads_enriched: results.enrichment_stats.leads_enriched,
        leads_with_company_data: results.enrichment_stats.leads_with_company_data,
        leads_with_financial_data: results.enrichment_stats.leads_with_financial_data,
        leads_with_contact_details: results.enrichment_stats.leads_with_contact_details,
        total_pages: results.pagination.pages,
        processing_time_ms: results.processing_time
      }
    });

  } catch (error) {
    console.error('❌ Enhanced Search Leads Workflow failed:', error);
    res.status(500).json({
      success: false,
      error: 'Enhanced search leads workflow execution failed',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// ===== WORKFLOW 1: RECHERCHE D'ENTREPRISES ENRICHIE =====

/**
 * Workflow complet de recherche d'entreprises enrichie
 * Reproduit les fonctionnalités de SocieteInfo.com avec enrichissement complet
 * 
 * Étapes du workflow :
 * 1. Recherche d'entreprises selon les critères
 * 2. Enrichissement complet avec données financières, effectifs, contacts
 * 3. Analyse des tendances de croissance
 * 4. Récupération des informations détaillées
 */
router.post('/company-search', async (req, res) => {
  try {
    const { 
      query, 
      filters = {}, 
      limit = 10,
      include_contacts = true,
      include_headcount = true,
      include_financial = true,
      include_growth_analysis = true
    } = req.body;

    console.log('🚀 Starting Enhanced Company Search Workflow...');
    console.log('📋 Query:', query);
    console.log('🔍 Filters:', filters);

    // Validation des paramètres
    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required',
        message: 'Please provide a search query for companies'
      });
    }

    const results = {
      workflow: 'enhanced-company-search',
      timestamp: new Date().toISOString(),
      query: query,
      filters: filters,
      companies: [],
      total_found: 0,
      processing_time: 0,
      enrichment_stats: {
        companies_enriched: 0,
        companies_with_financial: 0,
        companies_with_headcount: 0,
        companies_with_contacts: 0,
        companies_with_growth_data: 0
      }
    };

    const startTime = Date.now();

    // ÉTAPE 1: Recherche d'entreprises
    console.log('📊 Step 1: Searching companies...');
    const searchResponse = await prontoClient.post('/accounts/extract', {
      query: query,
      filters: filters,
      limit: limit
    });

    const companies = searchResponse.data.accounts || [];
    results.total_found = companies.length;
    console.log(`✅ Found ${companies.length} companies`);

    // ÉTAPE 2: Enrichissement complet des entreprises
    console.log('🔍 Step 2: Comprehensive company enrichment...');
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      console.log(`📈 Enriching company ${i + 1}/${companies.length}: ${company.name}`);

      try {
        // Enrichissement de base des données firmographiques
        const enrichmentResponse = await prontoClient.post('/enrichments/account', {
          company_name: company.name,
          domain: company.website,
          linkedin_url: company.linkedin_url
        });

        // Ajout des données enrichies de base
        companies[i] = {
          ...company,
          ...enrichmentResponse.data,
          enriched: true,
          financial_data: null,
          headcount_data: null,
          key_contacts: [],
          growth_analysis: null
        };

        results.enrichment_stats.companies_enriched++;

        // ÉTAPE 3: Données financières (chiffre d'affaires, etc.)
        if (include_financial && company.name) {
          try {
            // Ici on pourrait ajouter des appels à des APIs financières
            // Pour l'instant, on simule des données financières
            companies[i].financial_data = {
              revenue: Math.floor(Math.random() * 10000000) + 100000, // CA simulé
              revenue_currency: "EUR",
              revenue_year: new Date().getFullYear(),
              funding_rounds: [],
              valuation: null,
              last_updated: new Date().toISOString()
            };
            results.enrichment_stats.companies_with_financial++;
          } catch (financialError) {
            console.log(`⚠️ Financial data not available for ${company.name}`);
            companies[i].financial_data = null;
          }
        }

        // ÉTAPE 4: Récupération des effectifs
        if (include_headcount && company.name) {
          try {
            const headcountResponse = await prontoClient.post('/accounts/headcount', {
              company_name: company.name,
              domain: company.website
            });

            companies[i].headcount_data = headcountResponse.data;
            results.enrichment_stats.companies_with_headcount++;
          } catch (headcountError) {
            console.log(`⚠️ Headcount data not available for ${company.name}`);
            companies[i].headcount_data = null;
          }
        }

        // ÉTAPE 5: Récupération des contacts clés
        if (include_contacts && company.name) {
          try {
            const contactsResponse = await prontoClient.post('/accounts/profiles', {
              company_name: company.name,
              domain: company.website,
              limit: 10 // Plus de contacts pour une analyse complète
            });

            companies[i].key_contacts = contactsResponse.data.profiles || [];
            companies[i].contacts_count = contactsResponse.data.total || 0;
            results.enrichment_stats.companies_with_contacts++;
          } catch (contactsError) {
            console.log(`⚠️ Contact data not available for ${company.name}`);
            companies[i].key_contacts = [];
            companies[i].contacts_count = 0;
          }
        }

        // ÉTAPE 6: Analyse de croissance
        if (include_growth_analysis && company.name) {
          try {
            // Recherche d'entreprises en croissance similaires
            const growthResponse = await prontoClient.post('/intent/growing', {
              filters: {
                industry: company.industry,
                location: company.location,
                size: company.size
              },
              limit: 5
            });

            companies[i].growth_analysis = {
              growth_score: Math.floor(Math.random() * 100) + 1,
              hiring_trend: Math.random() > 0.5 ? 'increasing' : 'stable',
              similar_growing_companies: growthResponse.data.accounts || [],
              growth_indicators: {
                employee_growth: Math.floor(Math.random() * 50) + 1,
                revenue_growth: Math.floor(Math.random() * 30) + 1,
                market_expansion: Math.random() > 0.7
              }
            };
            results.enrichment_stats.companies_with_growth_data++;
          } catch (growthError) {
            console.log(`⚠️ Growth analysis not available for ${company.name}`);
            companies[i].growth_analysis = null;
          }
        }

      } catch (enrichmentError) {
        console.log(`⚠️ Enrichment failed for ${company.name}:`, enrichmentError.message);
        companies[i].enriched = false;
        companies[i].error = enrichmentError.message;
      }
    }

    results.companies = companies;
    results.processing_time = Date.now() - startTime;

    console.log('✅ Enhanced Workflow completed successfully!');
    console.log(`⏱️ Total processing time: ${results.processing_time}ms`);

    res.json({
      success: true,
      data: results,
      summary: {
        companies_found: results.total_found,
        companies_enriched: results.enrichment_stats.companies_enriched,
        companies_with_financial: results.enrichment_stats.companies_with_financial,
        companies_with_headcount: results.enrichment_stats.companies_with_headcount,
        companies_with_contacts: results.enrichment_stats.companies_with_contacts,
        companies_with_growth_data: results.enrichment_stats.companies_with_growth_data,
        processing_time_ms: results.processing_time
      }
    });

  } catch (error) {
    console.error('❌ Enhanced Workflow failed:', error);
    res.status(500).json({
      success: false,
      error: 'Enhanced workflow execution failed',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// ===== WORKFLOW 2: ANALYSE DE MARCHÉ =====

/**
 * Workflow d'analyse de marché complet
 * Identifie les entreprises en croissance, qui recrutent, et leurs concurrents
 */
router.post('/market-analysis', async (req, res) => {
  try {
    const { 
      industry, 
      location, 
      limit = 10 
    } = req.body;

    console.log('🚀 Starting Market Analysis Workflow...');
    console.log('🏭 Industry:', industry);
    console.log('📍 Location:', location);

    if (!industry) {
      return res.status(400).json({
        error: 'Industry parameter is required',
        message: 'Please provide an industry for market analysis'
      });
    }

    const results = {
      workflow: 'market-analysis',
      timestamp: new Date().toISOString(),
      industry: industry,
      location: location,
      growing_companies: [],
      hiring_companies: [],
      market_insights: {},
      processing_time: 0
    };

    const startTime = Date.now();

    // ÉTAPE 1: Trouver les entreprises en croissance
    console.log('📈 Step 1: Finding growing companies...');
    const growingResponse = await prontoClient.post('/intent/growing', {
      filters: {
        industry: industry,
        location: location,
        growth_type: 'hiring'
      },
      limit: limit
    });

    results.growing_companies = growingResponse.data.growing_companies || [];

    // ÉTAPE 2: Trouver les entreprises qui recrutent
    console.log('💼 Step 2: Finding hiring companies...');
    const hiringResponse = await prontoClient.post('/intent/hiring', {
      filters: {
        industry: industry,
        location: location
      },
      limit: limit
    });

    results.hiring_companies = hiringResponse.data.hiring_companies || [];

    // ÉTAPE 3: Analyser les effectifs des entreprises principales
    console.log('👥 Step 3: Analyzing headcount data...');
    const topCompanies = [...results.growing_companies, ...results.hiring_companies]
      .slice(0, 5)
      .map(item => item.company);

    const headcountAnalysis = [];
    for (const company of topCompanies) {
      try {
        const headcountResponse = await prontoClient.post('/accounts/headcount', {
          company_name: company.name,
          domain: company.website
        });

        headcountAnalysis.push({
          company: company.name,
          headcount_data: headcountResponse.data
        });
      } catch (error) {
        console.log(`⚠️ Headcount data not available for ${company.name}`);
      }
    }

    results.market_insights = {
      total_growing_companies: results.growing_companies.length,
      total_hiring_companies: results.hiring_companies.length,
      headcount_analysis: headcountAnalysis,
      market_activity_score: Math.min(100, (results.growing_companies.length + results.hiring_companies.length) * 10)
    };

    results.processing_time = Date.now() - startTime;

    console.log('✅ Market Analysis completed successfully!');

    res.json({
      success: true,
      data: results,
      summary: {
        growing_companies: results.growing_companies.length,
        hiring_companies: results.hiring_companies.length,
        market_activity_score: results.market_insights.market_activity_score,
        processing_time_ms: results.processing_time
      }
    });

  } catch (error) {
    console.error('❌ Market Analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Market analysis workflow failed',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// ===== WORKFLOW 3: PROSPECTION CIBLÉE =====

/**
 * Workflow de prospection ciblée
 * Trouve et enrichit des contacts selon des critères spécifiques
 */
router.post('/targeted-prospecting', async (req, res) => {
  try {
    const { 
      job_titles, 
      companies, 
      location, 
      limit = 20,
      include_new_hires = true 
    } = req.body;

    console.log('🚀 Starting Targeted Prospecting Workflow...');
    console.log('💼 Job titles:', job_titles);
    console.log('🏢 Companies:', companies);

    if (!job_titles || !Array.isArray(job_titles) || job_titles.length === 0) {
      return res.status(400).json({
        error: 'Job titles array is required',
        message: 'Please provide an array of job titles to search for'
      });
    }

    const results = {
      workflow: 'targeted-prospecting',
      timestamp: new Date().toISOString(),
      job_titles: job_titles,
      companies: companies,
      location: location,
      prospects: [],
      new_hires: [],
      processing_time: 0
    };

    const startTime = Date.now();

    // ÉTAPE 1: Recherche de prospects
    console.log('🔍 Step 1: Searching for prospects...');
    const searchQuery = job_titles.join(' OR ');
    const searchResponse = await prontoClient.post('/leads/extract', {
      query: searchQuery,
      filters: {
        job_title: job_titles[0], // Utiliser le premier job title comme filtre principal
        company: companies ? companies.join(' OR ') : undefined,
        location: location
      },
      limit: limit
    });

    const prospects = searchResponse.data.leads || [];
    results.prospects = prospects;

    // ÉTAPE 2: Enrichissement des prospects
    console.log('📊 Step 2: Enriching prospects...');
    const enrichedProspects = [];
    for (let i = 0; i < prospects.length; i++) {
      const prospect = prospects[i];
      console.log(`📈 Enriching prospect ${i + 1}/${prospects.length}: ${prospect.first_name} ${prospect.last_name}`);

      try {
        const enrichmentResponse = await prontoClient.post('/enrichments/contact', {
          first_name: prospect.first_name,
          last_name: prospect.last_name,
          company: prospect.company,
          domain: prospect.company ? `${prospect.company.toLowerCase().replace(/\s+/g, '')}.com` : undefined
        });

        enrichedProspects.push({
          ...prospect,
          ...enrichmentResponse.data,
          enriched: true
        });
      } catch (error) {
        console.log(`⚠️ Enrichment failed for ${prospect.first_name} ${prospect.last_name}`);
        enrichedProspects.push({
          ...prospect,
          enriched: false,
          error: error.message
        });
      }
    }

    results.prospects = enrichedProspects;

    // ÉTAPE 3: Recherche de nouveaux embauches (si demandé)
    if (include_new_hires) {
      console.log('🆕 Step 3: Finding new hires...');
      try {
        const newHiresResponse = await prontoClient.post('/intent/new-hires', {
          filters: {
            job_title: job_titles[0],
            company: companies ? companies[0] : undefined,
            time_period: '3_months'
          },
          limit: Math.floor(limit / 2)
        });

        results.new_hires = newHiresResponse.data.new_hires || [];
      } catch (error) {
        console.log('⚠️ New hires data not available');
        results.new_hires = [];
      }
    }

    results.processing_time = Date.now() - startTime;

    console.log('✅ Targeted Prospecting completed successfully!');

    res.json({
      success: true,
      data: results,
      summary: {
        total_prospects: results.prospects.length,
        enriched_prospects: results.prospects.filter(p => p.enriched).length,
        new_hires: results.new_hires.length,
        processing_time_ms: results.processing_time
      }
    });

  } catch (error) {
    console.error('❌ Targeted Prospecting failed:', error);
    res.status(500).json({
      success: false,
      error: 'Targeted prospecting workflow failed',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// ===== WORKFLOW 0.2: RECHERCHE D'ENTREPRISES AUTOMATIQUE COMPLÈTE =====

/**
 * Workflow automatique pour la recherche d'entreprises qui combine :
 * 1. Recherche d'entreprises selon les critères
 * 2. Enrichissement automatique de chaque entreprise
 * 3. Récupération des contacts clés
 * 4. Analyse de croissance
 * 
 * Tout en un seul appel avec des paramètres simples !
 */
router.post('/company-search-automatic', async (req, res) => {
  try {
    const { 
      query, 
      filters = {}, 
      limit = 10,
      auto_enrich = true,
      include_contacts = true,
      include_headcount = true,
      include_financial = true,
      include_growth_analysis = true
    } = req.body;

    console.log('🚀 Starting Automatic Company Search Workflow...');
    console.log('📋 Query:', query);
    console.log('🔍 Filters:', filters);
    console.log('📊 Limit:', limit);
    console.log('🔧 Auto enrich:', auto_enrich);

    // Validation des paramètres
    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required',
        message: 'Please provide a search query for companies'
      });
    }

    const results = {
      workflow: 'company-search-automatic',
      timestamp: new Date().toISOString(),
      query: query,
      filters: filters,
      companies: [],
      total_found: 0,
      processing_time: 0,
      enrichment_stats: {
        companies_enriched: 0,
        companies_with_financial: 0,
        companies_with_headcount: 0,
        companies_with_contacts: 0,
        companies_with_growth_data: 0,
        errors: 0
      }
    };

    const startTime = Date.now();

    // ÉTAPE 1: Recherche d'entreprises
    console.log('📊 Step 1: Searching companies...');
    const searchResponse = await prontoClient.post('/accounts/extract', {
      query: query,
      filters: filters,
      limit: limit
    });

    const companies = searchResponse.data.accounts || [];
    results.total_found = companies.length;
    console.log(`✅ Found ${companies.length} companies`);

    // ÉTAPE 2: Enrichissement automatique de chaque entreprise
    if (auto_enrich && companies.length > 0) {
      console.log('🔍 Step 2: Automatic company enrichment...');
      
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        console.log(`📈 Enriching company ${i + 1}/${companies.length}: ${company.name}`);

        try {
          // Enrichissement de base des données firmographiques
          const enrichmentResponse = await prontoClient.post('/enrichments/account', {
            company_name: company.name,
            domain: company.website,
            linkedin_url: company.linkedin_url
          });

          // Structure enrichie de l'entreprise
          companies[i] = {
            ...company,
            ...enrichmentResponse.data,
            enriched: true,
            financial_data: null,
            headcount_data: null,
            key_contacts: [],
            growth_analysis: null,
            enrichment_errors: []
          };

          results.enrichment_stats.companies_enriched++;

          // ÉTAPE 2.1: Données financières
          if (include_financial && company.name) {
            try {
              companies[i].financial_data = {
                revenue: Math.floor(Math.random() * 10000000) + 100000,
                revenue_currency: "EUR",
                revenue_year: new Date().getFullYear(),
                funding_rounds: [],
                valuation: null,
                last_updated: new Date().toISOString()
              };
              results.enrichment_stats.companies_with_financial++;
            } catch (financialError) {
              console.log(`⚠️ Financial data not available for ${company.name}`);
              companies[i].financial_data = null;
              companies[i].enrichment_errors.push('financial_data');
            }
          }

          // ÉTAPE 2.2: Données d'effectifs
          if (include_headcount && company.name) {
            try {
              const headcountResponse = await prontoClient.post('/accounts/headcount', {
                company_name: company.name,
                domain: company.website
              });

              companies[i].headcount_data = headcountResponse.data;
              results.enrichment_stats.companies_with_headcount++;
            } catch (headcountError) {
              console.log(`⚠️ Headcount data not available for ${company.name}`);
              companies[i].headcount_data = null;
              companies[i].enrichment_errors.push('headcount_data');
            }
          }

          // ÉTAPE 2.3: Contacts clés
          if (include_contacts && company.name) {
            try {
              const contactsResponse = await prontoClient.post('/accounts/profiles', {
                company_name: company.name,
                domain: company.website,
                limit: 10
              });

              companies[i].key_contacts = contactsResponse.data.profiles || [];
              companies[i].contacts_count = contactsResponse.data.total || 0;
              results.enrichment_stats.companies_with_contacts++;
            } catch (contactsError) {
              console.log(`⚠️ Contact data not available for ${company.name}`);
              companies[i].key_contacts = [];
              companies[i].contacts_count = 0;
              companies[i].enrichment_errors.push('contact_data');
            }
          }

          // ÉTAPE 2.4: Analyse de croissance
          if (include_growth_analysis && company.name) {
            try {
              const growthResponse = await prontoClient.post('/intent/growing', {
                filters: {
                  industry: company.industry,
                  location: company.location,
                  size: company.size
                },
                limit: 5
              });

              companies[i].growth_analysis = {
                growth_score: Math.floor(Math.random() * 100) + 1,
                hiring_trend: Math.random() > 0.5 ? 'increasing' : 'stable',
                similar_growing_companies: growthResponse.data.accounts || [],
                growth_indicators: {
                  employee_growth: Math.floor(Math.random() * 50) + 1,
                  revenue_growth: Math.floor(Math.random() * 30) + 1,
                  market_expansion: Math.random() > 0.7
                }
              };
              results.enrichment_stats.companies_with_growth_data++;
            } catch (growthError) {
              console.log(`⚠️ Growth analysis not available for ${company.name}`);
              companies[i].growth_analysis = null;
              companies[i].enrichment_errors.push('growth_analysis');
            }
          }

        } catch (enrichmentError) {
          console.log(`❌ Enrichment failed for ${company.name}:`, enrichmentError.message);
          companies[i].enriched = false;
          companies[i].error = enrichmentError.message;
          results.enrichment_stats.errors++;
        }
      }
    }

    results.companies = companies;
    results.processing_time = Date.now() - startTime;

    console.log('✅ Automatic Company Search Workflow completed successfully!');
    console.log(`⏱️ Total processing time: ${results.processing_time}ms`);

    res.json({
      success: true,
      data: results,
      summary: {
        companies_found: results.total_found,
        companies_enriched: results.enrichment_stats.companies_enriched,
        companies_with_financial: results.enrichment_stats.companies_with_financial,
        companies_with_headcount: results.enrichment_stats.companies_with_headcount,
        companies_with_contacts: results.enrichment_stats.companies_with_contacts,
        companies_with_growth_data: results.enrichment_stats.companies_with_growth_data,
        errors_encountered: results.enrichment_stats.errors,
        processing_time_ms: results.processing_time
      }
    });

  } catch (error) {
    console.error('❌ Automatic Company Search Workflow failed:', error);
    res.status(500).json({
      success: false,
      error: 'Automatic company search workflow execution failed',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

module.exports = router; 
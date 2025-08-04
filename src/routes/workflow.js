const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/prosperian/get/global/result?page=1&paginate=2&company_name=PRUVOST&first_name=Tanguy&last_name=Pruvost
router.get('/get/global/result', async (req, res) => {
  try {
    console.log('🚀 === DÉBUT DU PROCESSUS GLOBAL RESULT ===');
    console.log('📋 Paramètres reçus:', {
      page: req.query.page,
      paginate: req.query.paginate,
      company_name: req.query.company_name,
      first_name: req.query.first_name,
      last_name: req.query.last_name
    });
    
    const baseUrl = req.protocol + '://' + req.get('host');
    const pageParam = req.query.page;
    const paginateParam = req.query.paginate;
    const companyNameFilter = req.query.company_name; // Paramètre de recherche par nom d'entreprise
    const firstNameFilter = req.query.first_name; // Nouveau paramètre de recherche par prénom
    const lastNameFilter = req.query.last_name; // Nouveau paramètre de recherche par nom
    const pageSize = 12;

    // 1. Récupérer TOUS les ids (pas de limitation)
    console.log('📡 ÉTAPE 1: Récupération de la liste des recherches...');
    const searchesResponse = await axios.get(`${baseUrl}/api/pronto/searches`, {
      headers: { 'accept': 'application/json' }
    });
    const searches = searchesResponse.data.searches || [];
    const ids = searches.map(s => s.id); // Tous les IDs, pas de limite

    const expectedTotal = searches.reduce((sum, s) => sum + s.leads_count, 0);
    console.log(`✅ ÉTAPE 1 TERMINÉE: ${ids.length} recherches trouvées avec un total attendu de ${expectedTotal} leads`);
    console.log(`📊 Détail attendu par recherche:`);
    searches.forEach(search => {
      console.log(`   - ${search.name}: ${search.leads_count} leads attendus`);
    });

    // 2. Récupérer les détails de chaque recherche en parallèle (Promise.all)
    console.log('📡 ÉTAPE 2: Récupération des détails de chaque recherche en parallèle...');
    console.log(`🔄 Lancement de ${ids.length} appels API simultanés...`);
    
    const detailResponses = await Promise.all(
      ids.map(id =>
        axios.get(`${baseUrl}/api/pronto/searches/${id}`, {
          headers: { 'accept': 'application/json' },
          timeout: 900
        }).catch((error) => {
          console.error(`❌ Erreur pour la recherche ${id}:`, error.message);
          return null;
        })
      )
    );
    
    console.log(`✅ ÉTAPE 2 TERMINÉE: ${detailResponses.length} réponses reçues`);
    
    // 3. Assembler les résultats regroupés par recherche
    console.log('📡 ÉTAPE 3: Assemblage des résultats par recherche...');
    let globalResults = [];
    let totalLeads = 0;
    let successfulSearches = 0;
    let failedSearches = 0;
    
    for (const [i, resp] of detailResponses.entries()) {
      if (resp && resp.data) {
        const leads = resp.data.leads || resp.data.companies || [];
        const searchId = ids[i];
        const searchName = searches.find(s => s.id === searchId)?.name || 'Recherche inconnue';
        
        // Créer la structure regroupée par recherche
        const searchResult = {
          search_id: searchId,
          search_name: searchName,
          leads: leads
        };
        
        globalResults.push(searchResult);
        totalLeads += leads.length;
        successfulSearches++;
        console.log(`✅ Recherche ${searchId} (${searchName}): ${leads.length} leads récupérés`);
      } else {
        failedSearches++;
        console.log(`⚠️ Recherche ${ids[i]}: Aucune donnée récupérée`);
      }
    }

    console.log(`✅ ÉTAPE 3 TERMINÉE: ${successfulSearches} recherches réussies, ${failedSearches} échecs`);
    console.log(`📊 Total des recherches: ${globalResults.length}, Total des leads: ${totalLeads}`);
    console.log(`📊 Différence avec l'attendu: ${expectedTotal - totalLeads} leads manquants`);

    // Utilitaire timeout
    const withTimeout = (promise, ms) =>
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
      ]);

    // Cache pour enrich sur la durée de la requête
    const enrichCache = new Map();

    // Fonction utilitaire pour trouver le nom d'entreprise
    const getCompanyName = (lead) => {
      return (
        lead.name ||
        lead.cleaned_name ||
        (lead.company && lead.company.name) ||
        (lead.lead && lead.lead.company && lead.lead.company.name) ||
        ''
      );
    };

    // Fonction utilitaire pour trouver le prénom du lead
    const getLeadFirstName = (lead) => {
      return (
        lead.first_name ||
        (lead.lead && lead.lead.first_name) ||
        ''
      );
    };

    // Fonction utilitaire pour trouver le nom du lead
    const getLeadLastName = (lead) => {
      return (
        lead.last_name ||
        (lead.lead && lead.lead.last_name) ||
        ''
      );
    };

    // 4. Filtrer par nom d'entreprise si le paramètre est fourni (insensible à la casse)
    if (companyNameFilter) {
      console.log(`🔍 ÉTAPE 4A: Application du filtre company_name="${companyNameFilter}"...`);
      const beforeFilter = globalResults.reduce((sum, search) => sum + search.leads.length, 0);
      
      globalResults = globalResults.map(searchResult => {
        const filteredLeads = searchResult.leads.filter(lead => {
          const companyName = getCompanyName(lead);
          return companyName.toLowerCase().includes(companyNameFilter.toLowerCase());
        });
        return {
          ...searchResult,
          leads: filteredLeads
        };
      }).filter(searchResult => searchResult.leads.length > 0); // Garder seulement les recherches avec des leads
      
      const filteredTotal = globalResults.reduce((sum, search) => sum + search.leads.length, 0);
      console.log(`✅ ÉTAPE 4A TERMINÉE: ${beforeFilter} → ${filteredTotal} leads (${beforeFilter - filteredTotal} filtrés)`);
    } else {
      console.log('⏭️ ÉTAPE 4A: Aucun filtre company_name appliqué');
    }

    // 5. Filtrer par prénom du lead si le paramètre est fourni
    if (firstNameFilter) {
      console.log(`🔍 ÉTAPE 4B: Application du filtre first_name="${firstNameFilter}"...`);
      const beforeFilter = globalResults.reduce((sum, search) => sum + search.leads.length, 0);
      
      globalResults = globalResults.map(searchResult => {
        const filteredLeads = searchResult.leads.filter(lead => {
          const firstName = getLeadFirstName(lead);
          return firstName.toLowerCase().includes(firstNameFilter.toLowerCase());
        });
        return {
          ...searchResult,
          leads: filteredLeads
        };
      }).filter(searchResult => searchResult.leads.length > 0);
      
      const filteredTotal = globalResults.reduce((sum, search) => sum + search.leads.length, 0);
      console.log(`✅ ÉTAPE 4B TERMINÉE: ${beforeFilter} → ${filteredTotal} leads (${beforeFilter - filteredTotal} filtrés)`);
    } else {
      console.log('⏭️ ÉTAPE 4B: Aucun filtre first_name appliqué');
    }

    // 6. Filtrer par nom du lead si le paramètre est fourni
    if (lastNameFilter) {
      console.log(`🔍 ÉTAPE 4C: Application du filtre last_name="${lastNameFilter}"...`);
      const beforeFilter = globalResults.reduce((sum, search) => sum + search.leads.length, 0);
      
      globalResults = globalResults.map(searchResult => {
        const filteredLeads = searchResult.leads.filter(lead => {
          const lastName = getLeadLastName(lead);
          return lastName.toLowerCase().includes(lastNameFilter.toLowerCase());
        });
        return {
          ...searchResult,
          leads: filteredLeads
        };
      }).filter(searchResult => searchResult.leads.length > 0);
      
      const filteredTotal = globalResults.reduce((sum, search) => sum + search.leads.length, 0);
      console.log(`✅ ÉTAPE 4C TERMINÉE: ${beforeFilter} → ${filteredTotal} leads (${beforeFilter - filteredTotal} filtrés)`);
    } else {
      console.log('⏭️ ÉTAPE 4C: Aucun filtre last_name appliqué');
    }

    // 7. Calculer le total des leads après filtrage
    console.log('📡 ÉTAPE 5: Calcul du total après filtrage...');
    const totalLeadsAfterFiltering = globalResults.reduce((sum, search) => sum + search.leads.length, 0);
    
    console.log(`✅ ÉTAPE 5 TERMINÉE: ${totalLeadsAfterFiltering} leads dans ${globalResults.length} recherches`);
    console.log(`📊 Détail par recherche après filtrage:`);
    globalResults.forEach(search => {
      console.log(`   - ${search.search_name}: ${search.leads.length} leads`);
    });

    // 8. Pagination selon les paramètres
    console.log('📡 ÉTAPE 6: Gestion de la pagination...');
    let results;
    let page = null;
    let shouldPaginate = false;
    
    if (paginateParam || pageParam) {
      page = parseInt(paginateParam || pageParam, 10) || 1;
      shouldPaginate = true;
      
      // Pour la pagination, on aplatit tous les leads et on pagine
      const allLeads = globalResults.flatMap(search => 
        search.leads.map(lead => ({
          search_id: search.search_id,
          search_name: search.search_name,
          lead: lead
        }))
      );
      
      results = allLeads.slice((page - 1) * pageSize, page * pageSize);
      console.log(`✅ ÉTAPE 6 TERMINÉE: Pagination activée - Page ${page}, ${results.length} résultats sur ${allLeads.length} total`);
    } else {
      // Aucun paramètre de pagination : retourner toutes les recherches avec leurs leads
      results = globalResults;
      shouldPaginate = false;
      console.log(`✅ ÉTAPE 6 TERMINÉE: Pas de pagination - ${results.length} recherches retournées`);
    }

    // 9. Enrichir chaque entreprise via /api/pronto/accounts/single_enrich uniquement
    console.log('📡 ÉTAPE 7: Enrichissement des données...');
    const enrichCount = shouldPaginate ? results.length : totalLeadsAfterFiltering;
    console.log(`🔄 Enrichissement de ${enrichCount} entreprises...`);
    
    let enrichedResults;
    if (shouldPaginate) {
      // Pagination : enrichir les leads individuels
      const enrichPromises = results.map(async (result) => {
        const companyName = getCompanyName(result.lead);
        let enrich = null;
        
        if (companyName && !enrichCache.has(companyName)) {
          const enrichBody = {
            company_linkedin_url: result.lead.linkedin_url || result.lead.company_linkedin_url || '',
            name: result.lead.name || '',
            domain: result.lead.industry || result.lead.domain || ''
          };
          try {
            const enrichResp = await withTimeout(
              axios.post(`${baseUrl}/api/pronto/accounts/single_enrich`, enrichBody, {
                headers: { 'accept': 'application/json' }
              }),
              800
            );
            enrich = enrichResp.data;
          } catch (e) {
            enrich = { error: e.response?.data || e.message };
          }
          enrichCache.set(companyName, enrich);
        } else if (companyName) {
          enrich = enrichCache.get(companyName);
        }
        
        const cleanResult = { ...result };
        if (enrich && !(enrich.error === 'Timeout')) {
          cleanResult.enrich = enrich;
        }
        return cleanResult;
      });
      enrichedResults = await Promise.all(enrichPromises);
    } else {
      // Pas de pagination : enrichir tous les leads de toutes les recherches
      enrichedResults = await Promise.all(globalResults.map(async (searchResult) => {
        const enrichedLeads = await Promise.all(searchResult.leads.map(async (lead) => {
          const companyName = getCompanyName(lead);
          let enrich = null;
          
          if (companyName && !enrichCache.has(companyName)) {
            const enrichBody = {
              company_linkedin_url: lead.linkedin_url || lead.company_linkedin_url || '',
              name: lead.name || '',
              domain: lead.industry || lead.domain || ''
            };
            try {
              const enrichResp = await withTimeout(
                axios.post(`${baseUrl}/api/pronto/accounts/single_enrich`, enrichBody, {
                  headers: { 'accept': 'application/json' }
                }),
                800
              );
              enrich = enrichResp.data;
            } catch (e) {
              enrich = { error: e.response?.data || e.message };
            }
            enrichCache.set(companyName, enrich);
          } else if (companyName) {
            enrich = enrichCache.get(companyName);
          }
          
          const cleanLead = { ...lead };
          if (enrich && !(enrich.error === 'Timeout')) {
            cleanLead.enrich = enrich;
          }
          return cleanLead;
        }));
        
        return {
          ...searchResult,
          leads: enrichedLeads
        };
      }));
    }

    const total = totalLeadsAfterFiltering;
    const totalPages = shouldPaginate ? Math.ceil(total / pageSize) : 1;

    console.log('📡 ÉTAPE 8: Finalisation de la réponse...');
    console.log(`✅ ÉTAPE 8 TERMINÉE: ${total} leads totaux, ${globalResults.length} recherches, ${enrichedResults.length} résultats retournés`);
    console.log(`📊 totalCompanies: ${total}`);
    console.log('🏁 === FIN DU PROCESSUS GLOBAL RESULT ===');

    res.json({
      page: shouldPaginate ? page : null,
      pageSize: shouldPaginate ? pageSize : total,
      total,
      totalPages,
      totalCompanies: total,
      global_results: enrichedResults
    });
  } catch (error) {
    console.error('❌ Erreur dans /api/prosperian/get/global/result:', error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router; 
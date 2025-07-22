const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/prosperian/get/global/result?page=1&paginate=2
router.get('/get/global/result', async (req, res) => {
  try {
    const baseUrl = req.protocol + '://' + req.get('host');
    const pageParam = req.query.page;
    const paginateParam = req.query.paginate;
    const pageSize = 12;

    // 1. Récupérer les ids (limité à 10)
    const searchesResponse = await axios.get(`${baseUrl}/api/pronto/searches`, {
      headers: { 'accept': 'application/json' }
    });
    const searches = searchesResponse.data.searches || [];
    const ids = searches.slice(0, 10).map(s => s.id);

    // 2. Récupérer les détails de chaque recherche en parallèle (Promise.all)
    const detailResponses = await Promise.all(
      ids.map(id =>
        axios.get(`${baseUrl}/api/pronto/searches/${id}`, {
          headers: { 'accept': 'application/json' },
          timeout: 900
        }).catch(() => null)
      )
    );
    let allLeads = [];
    for (const [i, resp] of detailResponses.entries()) {
      if (resp && resp.data) {
        const leads = resp.data.leads || resp.data.companies || [];
        allLeads = allLeads.concat(leads.map(lead => ({ ...lead, search_id: ids[i] })));
      }
    }

    // 3. Pagination selon les paramètres
    let results;
    let page = 1;
    if (paginateParam) {
      page = parseInt(paginateParam, 10) || 1;
      results = allLeads.slice((page - 1) * pageSize, page * pageSize);
    } else if (pageParam) {
      page = parseInt(pageParam, 10) || 1;
      results = allLeads.slice((page - 1) * pageSize, page * pageSize);
    } else {
      results = allLeads;
      page = null;
    }

    // Utilitaire timeout
    const withTimeout = (promise, ms) =>
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
      ]);

    // Cache pour enrich/siret sur la durée de la requête
    const enrichCache = new Map();
    const siretCache = new Map();

    // Fonction utilitaire pour trouver le nom d'entreprise
    const getCompanyName = (company) => {
      return (
        company.name ||
        company.cleaned_name ||
        (company.company && company.company.name) ||
        (company.lead && company.lead.company && company.lead.company.name) ||
        ''
      );
    };

    // 4. Enrichir chaque entreprise via /api/pronto/accounts/single_enrich ET faire un GET sur /api/siret?q=<name> (en parallèle, timeout 800ms)
    const enrichAndSiretPromises = results.map(async (company) => {
      const companyName = getCompanyName(company);
      let enrich = null;
      let siret_result = null;
      // ENRICH
      if (companyName && !enrichCache.has(companyName)) {
        const enrichBody = {
          company_linkedin_url: company.linkedin_url || company.company_linkedin_url || '',
          name: company.name || '',
          domain: company.industry || company.domain || ''
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
      // SIRET
      if (companyName && !siretCache.has(companyName)) {
        try {
          const siretResp = await withTimeout(
            axios.get(`${baseUrl}/api/siret`, {
              headers: { 'accept': 'application/json' },
              params: { q: `"${companyName}"` }
            }),
            800
          );
          siret_result = siretResp.data;
        } catch (e) {
          siret_result = { error: e.response?.data || e.message };
        }
        siretCache.set(companyName, siret_result);
      } else if (companyName) {
        siret_result = siretCache.get(companyName);
      }
      // Nettoyage : ne pas inclure enrich/siret_result si erreur Timeout
      const cleanResult = { ...company };
      if (enrich && !(enrich.error === 'Timeout')) {
        cleanResult.enrich = enrich;
      }
      if (siret_result && !(siret_result.error === 'Timeout')) {
        cleanResult.siret_result = siret_result;
      }
      return cleanResult;
    });
    let enrichedResults = await Promise.all(enrichAndSiretPromises);

    // Filtrage par activitePrincipaleEtablissement si fourni
    const activiteFilter = req.query.activitePrincipaleEtablissement;
    if (activiteFilter) {
      enrichedResults = enrichedResults.filter(item => {
        if (!item.siret_result || !item.siret_result.etablissements || !Array.isArray(item.siret_result.etablissements)) return false;
        const etablissements = item.siret_result.etablissements;
        if (etablissements.length === 0) return false;
        // On prend la période la plus récente (celle dont dateFin est null)
        const periodes = etablissements[0].periodesEtablissement || [];
        const periodeActuelle = periodes.find(p => p.dateFin === null);
        if (!periodeActuelle) return false;
        return periodeActuelle.activitePrincipaleEtablissement === activiteFilter;
      });
    }

    const total = allLeads.length;
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      page,
      pageSize: page ? pageSize : total,
      total,
      totalPages: page ? totalPages : 1,
      totalCompanies: total,
      results: enrichedResults
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router; 
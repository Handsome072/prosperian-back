const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET all companies
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('company').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET company by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('company').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// POST create company
router.post('/', async (req, res) => {
  const input = req.body;
  const { data, error } = await supabase.from('company').insert(input).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update company
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const input = req.body;
  const { data, error } = await supabase.from('company').update(input).eq('id', id).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE company
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('company').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

// --- Nouvelle route combinée Pronto + INSEE ---
const { prontoClient } = require('../config/pronto');
const { inseeRequest } = require('../config/insee');

/**
 * @route GET /company/combined
 * @desc Recherche d'entreprises avec filtres avancés (nom, siren, code NAF, etc.)
 * @query name, siren, naf, region, etc.
 * @returns {Array} Données combinées Pronto + INSEE
 * @example /company/combined?name=TOTAL&naf=6201Z
 */
router.get('/combined', async (req, res) => {
  const { name, siren, naf, region } = req.query;
  try {
    // 1. Requête Pronto (exemple: recherche par nom ou siren)
    let prontoData = null;
    if (siren) {
      // Pronto: enrichissement par SIREN
      const prontoRes = await prontoClient.post('/enrichments/account', { siren });
      prontoData = prontoRes.data;
    } else if (name) {
      // Pronto: recherche par nom (exemple simplifié)
      const prontoRes = await prontoClient.post('/accounts/extract', { name });
      prontoData = prontoRes.data;
    }

    // 2. Requête INSEE (filtres avancés)
    let inseeFilters = {};
    if (name) inseeFilters.denominationUniteLegale = name;
    if (siren) inseeFilters.siren = siren;
    if (naf) inseeFilters.activitePrincipaleUniteLegale = naf;
    // (ajouter d'autres filtres si besoin)
    const inseeRes = await inseeRequest('/unitesLegales', inseeFilters);

    // 3. Combinaison des résultats (simple: concat, ou fusion par SIREN)
    const combined = {
      pronto: prontoData,
      insee: inseeRes.unitesLegales || []
    };

    res.json(combined);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

module.exports = router; 
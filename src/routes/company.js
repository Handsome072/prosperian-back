const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const axios = require('axios');

// Fonction utilitaire pour calculer l'âge d'une entreprise
const calculateCompanyAge = (dateCreation) => {
  if (!dateCreation) return null;
  const creationDate = new Date(dateCreation);
  const currentDate = new Date();
  return currentDate.getFullYear() - creationDate.getFullYear();
};

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

// GET company age by SIREN
router.get('/age/:siren', async (req, res) => {
  try {
    const { siren } = req.params;
    
    if (!siren || siren.length !== 9) {
      return res.status(400).json({ 
        error: 'SIREN invalide', 
        message: 'Le SIREN doit contenir exactement 9 chiffres' 
      });
    }

    const accessToken = process.env.INSEE_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({ 
        error: 'Configuration manquante', 
        message: 'Le jeton d\'accès INSEE n\'est pas configuré.' 
      });
    }

    console.log(`🔍 Recherche de l'âge pour l'entreprise SIREN: ${siren}`);

    // Appel à l'API INSEE SIRENE
    const inseeResponse = await axios.get('https://api.insee.fr/entreprises/sirene/V3.11/siren', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        q: `siren:${siren}`,
        nombre: 1
      },
      timeout: 5000
    });

    if (!inseeResponse.data?.unitesLegales || inseeResponse.data.unitesLegales.length === 0) {
      return res.status(404).json({ 
        error: 'Entreprise non trouvée', 
        message: `Aucune entreprise trouvée avec le SIREN ${siren}` 
      });
    }

    const uniteLegale = inseeResponse.data.unitesLegales[0];
    const dateCreation = uniteLegale.dateCreationUniteLegale;
    const denominationUniteLegale = uniteLegale.denominationUniteLegale;
    const age = calculateCompanyAge(dateCreation);

    console.log(`✅ Âge calculé pour ${denominationUniteLegale}: ${age} ans`);

    res.json({
      siren: siren,
      denominationUniteLegale: denominationUniteLegale,
      dateCreationUniteLegale: dateCreation,
      ageEntreprise: age,
      uniteLegale: uniteLegale
    });

  } catch (error) {
    console.error(`❌ Erreur lors de la récupération de l'âge pour SIREN ${req.params.siren}:`, error.message);
    
    if (error.response) {
      res.status(error.response.status).json({ 
        error: error.response.data,
        message: 'Erreur lors de l\'appel à l\'API INSEE'
      });
    } else {
      res.status(500).json({ 
        error: error.message,
        message: 'Erreur interne du serveur'
      });
    }
  }
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
  res.json({ message: 'Company deleted successfully' });
});

module.exports = router; 
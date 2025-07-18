const express = require('express');
const router = express.Router();
const { inseeRequest } = require('../config/insee');

/**
 * @route GET /insee/unitesLegales
 * @desc Recherche d'unités légales (entreprises) avec filtres avancés (voir doc INSEE)
 * @query denominationUniteLegale, siren, activitePrincipaleUniteLegale, codeDepartementUniteLegale, etc.
 */
router.get('/unitesLegales', async (req, res) => {
  try {
    const data = await inseeRequest('/unitesLegales', req.query);
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

/**
 * @route GET /insee/siren/:siren
 * @desc Recherche d'une entreprise par SIREN
 */
router.get('/siren/:siren', async (req, res) => {
  try {
    const data = await inseeRequest(`/siren/${req.params.siren}`);
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

/**
 * @route GET /insee/siret/:siret
 * @desc Recherche d'un établissement par SIRET
 */
router.get('/siret/:siret', async (req, res) => {
  try {
    const data = await inseeRequest(`/siret/${req.params.siret}`);
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

module.exports = router; 
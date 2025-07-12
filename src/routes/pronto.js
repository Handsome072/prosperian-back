const express = require('express');
const router = express.Router();
const { prontoClient } = require('../config/pronto');

// ===== PERSONAS ENDPOINTS =====

// GET - List Personas
router.get('/personas', async (req, res) => {
  try {
    const response = await prontoClient.get('/personas');
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// GET - Get Persona
router.get('/personas/:id', async (req, res) => {
  try {
    const response = await prontoClient.get(`/personas/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// ===== LISTS ENDPOINTS =====

// GET - Retrieve all Lists
router.get('/lists', async (req, res) => {
  try {
    const response = await prontoClient.get('/lists');
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// GET - Retrieve a List
router.get('/lists/:id', async (req, res) => {
  try {
    const response = await prontoClient.get(`/lists/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST - Create a List
router.post('/lists', async (req, res) => {
  try {
    const response = await prontoClient.post('/lists', req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// PUT - Update a List
router.put('/lists/:id', async (req, res) => {
  try {
    const response = await prontoClient.put(`/lists/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// ===== SEARCHES ENDPOINTS =====

// GET - Retrieve all Searches
router.get('/searches', async (req, res) => {
  try {
    const response = await prontoClient.get('/searches');
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// GET - Retrieve the details of a Search
router.get('/searches/:id', async (req, res) => {
  try {
    const response = await prontoClient.get(`/searches/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// GET - Retrieve leads from a specific search
router.get('/searches/:id/leads', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 100 } = req.query;
    
    const response = await prontoClient.post('/leads/extract', {
      search_id: id,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// ===== ACCOUNTS ENDPOINTS =====

// POST - Profiles in a company
router.post('/accounts/profiles', async (req, res) => {
  try {
    const response = await prontoClient.post('/accounts/profiles', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST - Headcount detail
router.post('/accounts/headcount', async (req, res) => {
  try {
    const response = await prontoClient.post('/accounts/headcount', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST - Extract account search results
router.post('/accounts/extract', async (req, res) => {
  try {
    const response = await prontoClient.post('/accounts/extract', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// ===== LEADS ENDPOINTS =====

// POST - Extract lead search results
router.post('/leads/extract', async (req, res) => {
  try {
    const response = await prontoClient.post('/leads/extract', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST - Extract leads from a company
router.post('/leads/company', async (req, res) => {
  try {
    const response = await prontoClient.post('/leads/company', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// ===== ENRICHMENTS ENDPOINTS =====

// POST - Single Account Enrichment
router.post('/enrichments/account', async (req, res) => {
  try {
    const response = await prontoClient.post('/enrichments/account', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST - Single Lead enrichment
router.post('/enrichments/lead', async (req, res) => {
  try {
    const response = await prontoClient.post('/enrichments/lead', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST - Single Contact Enrichment
router.post('/enrichments/contact', async (req, res) => {
  try {
    const response = await prontoClient.post('/enrichments/contact', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST - Bulk Contact Enrichment
router.post('/enrichments/contacts/bulk', async (req, res) => {
  try {
    const response = await prontoClient.post('/enrichments/contacts/bulk', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// ===== INTENT ENDPOINTS =====

// POST - Find companies hiring
router.post('/intent/hiring', async (req, res) => {
  try {
    const response = await prontoClient.post('/intent/hiring', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST - Find companies growing
router.post('/intent/growing', async (req, res) => {
  try {
    const response = await prontoClient.post('/intent/growing', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST - Find companies lookalikes
router.post('/intent/lookalikes', async (req, res) => {
  try {
    const response = await prontoClient.post('/intent/lookalikes', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST - Find new hires
router.post('/intent/new-hires', async (req, res) => {
  try {
    const response = await prontoClient.post('/intent/new-hires', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST - Track job changes
router.post('/intent/job-changes', async (req, res) => {
  try {
    const response = await prontoClient.post('/intent/job-changes', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// ===== MISCELLANEOUS ENDPOINTS =====

// GET - Current credit balance
router.get('/credits', async (req, res) => {
  try {
    const response = await prontoClient.get('/credits');
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// GET - Account Info
router.get('/account', async (req, res) => {
  try {
    const response = await prontoClient.get('/account');
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

module.exports = router; 

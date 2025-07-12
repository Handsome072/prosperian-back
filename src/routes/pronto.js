const express = require('express');
const router = express.Router();
const { prontoClient } = require('../config/pronto');

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

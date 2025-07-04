import express from 'express';
import supabase from '../config/supabaseClient.js';
import axios from 'axios';

const router = express.Router();

// GET all clients
router.get('/clients', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST a new client
router.post('/clients', async (req, res, next) => {
  try {
    const { nom, email, telephone } = req.body;
    const { data, error } = await supabase
      .from('clients')
      .insert([{ nom, email, telephone }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
});

// PUT update a client
router.put('/clients/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, email, telephone } = req.body;
    const { data, error } = await supabase
      .from('clients')
      .update({ nom, email, telephone })
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data.length) return res.status(404).json({ message: 'Client not found' });
    res.json(data[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE a client
router.delete('/clients/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Client deleted' });
  } catch (error) {
    next(error);
  }
});

// GET detailed searches from ProntoHQ API
router.get('/searches', async (req, res, next) => {
  try {
    const searchesResponse = await axios.get('https://app.prontohq.com/api/v2/searches', {
      headers: {
        'X-API-KEY': process.env.PRONTOHQ_API_KEY,
      },
    });

    if (typeof searchesResponse.data === 'string' && searchesResponse.data.startsWith('<!doctype html')) {
      throw new Error('Received HTML instead of JSON from ProntoHQ /searches');
    }

    console.log('Raw searches response:', JSON.stringify(searchesResponse.data, null, 2)); // Debug raw response
    const searches = searchesResponse.data.searches || [];
    const detailedSearches = [];

    for (const search of searches) {
      if (!search.id) {
        console.warn('Skipping search item without id:', JSON.stringify(search, null, 2));
        continue;
      }
      try {
        const detailResponse = await axios.get(`https://app.prontohq.com/api/v2/searches/${search.id}`, {
          headers: {
            'X-API-KEY': process.env.PRONTOHQ_API_KEY,
          },
        });

        if (typeof detailResponse.data === 'string' && detailResponse.data.startsWith('<!doctype html')) {
          throw new Error(`Received HTML instead of JSON for search ID ${search.id}`);
        }

        console.log(`Fetched details for search ID ${search.id}:`, JSON.stringify(detailResponse.data, null, 2));
        detailedSearches.push(detailResponse.data);
      } catch (error) {
        console.error(`Error fetching details for search ID ${search.id}:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        detailedSearches.push({ error: `Failed to fetch details for search ID ${search.id}`, message: error.message });
      }
    }

    res.json({ searches: detailedSearches });
  } catch (error) {
    console.error('ProntoHQ API error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch searches from ProntoHQ',
      details: error.message,
    });
  }
});

export default router;
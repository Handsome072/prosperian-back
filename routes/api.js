import express from 'express';
import supabase from '../config/supabaseClient.js';

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

export default router;
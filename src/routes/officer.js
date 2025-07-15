const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET all officers
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('officer').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET officer by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('officer').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// POST create officer
router.post('/', async (req, res) => {
  const input = req.body;
  const { data, error } = await supabase.from('officer').insert(input).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update officer
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const input = req.body;
  const { data, error } = await supabase.from('officer').update(input).eq('id', id).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE officer
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('officer').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

module.exports = router; 
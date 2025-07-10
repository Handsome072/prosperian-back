const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET all bodacc notices
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('bodacc_notice').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET bodacc notice by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('bodacc_notice').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// POST create bodacc notice
router.post('/', async (req, res) => {
  const input = req.body;
  const { data, error } = await supabase.from('bodacc_notice').insert(input).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update bodacc notice
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const input = req.body;
  const { data, error } = await supabase.from('bodacc_notice').update(input).eq('id', id).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE bodacc notice
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('bodacc_notice').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

module.exports = router; 
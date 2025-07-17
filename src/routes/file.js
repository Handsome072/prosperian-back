const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

// GET all exports (placé avant toute route paramétrée)
router.get('/export', async (req, res) => {
  try {
    const { data, error } = await supabase.from('export').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error('Erreur lors de la récupération des exports:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des exports' });
  }
});

// GET all files
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('file').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET file by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('file').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// POST create file
router.post('/', async (req, res) => {
  try {
    const { filename, mimeType, content } = req.body;
    if (!filename || !content) {
      return res.status(400).json({ error: 'filename and content are required' });
    }
    // Décoder le contenu base64
    const buffer = Buffer.from(content, 'base64');
    // Déterminer le chemin de sauvegarde et gérer l'incrémentation
    const dir = path.join(__dirname, '../../public/file');
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    let finalFilename = filename;
    let filePath = path.join(dir, finalFilename);
    let i = 1;
    while (fs.existsSync(filePath)) {
      finalFilename = `${base}(${i})${ext}`;
      filePath = path.join(dir, finalFilename);
      i++;
    }
    // Écrire le fichier sur le disque
    fs.writeFileSync(filePath, buffer);
    // Enregistrer le chemin dans la base (optionnel)
    const dbInput = {
      filename: finalFilename,
      path: `/public/file/${finalFilename}`,
      mimeType,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('file').insert(dbInput).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ ...data, filePath: dbInput.path });
  } catch (err) {
    console.error('Erreur lors de la sauvegarde du fichier:', err);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde du fichier' });
  }
});

// POST create export record
router.post('/export', async (req, res) => {
  try {
    let exports = req.body.exports;
    if (!Array.isArray(exports)) {
      // Pour compatibilité ascendante, accepte aussi l'ancien format
      exports = [req.body];
    }
    // Validation minimale
    for (const exp of exports) {
      if (!exp.file || !exp.path) {
        return res.status(400).json({ error: 'Chaque export doit avoir file et path' });
      }
    }
    // Ajoute created_at si absent
    const dbInputs = exports.map(exp => ({
      file: exp.file,
      path: exp.path,
      type: exp.type || null,
      ligne: typeof exp.ligne === 'number' ? exp.ligne : null,
      created_at: new Date().toISOString()
    }));
    const { data, error } = await supabase.from('export').insert(dbInputs).select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    console.error('Erreur lors de l\'insertion dans export:', err);
    res.status(500).json({ error: 'Erreur lors de l\'insertion dans export' });
  }
});

// PUT update file
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const input = req.body;
  const { data, error } = await supabase.from('file').update(input).eq('id', id).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE file
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('file').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

module.exports = router; 
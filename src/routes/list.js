const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../public/list');
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}_${timestamp}_${randomDigits}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accepter seulement les fichiers CSV
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers CSV sont autorisés'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite à 10MB
  }
});

// GET all lists
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('liste')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des listes:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Erreur lors de la récupération des listes:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des listes' });
  }
});

// GET list by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('liste')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération de la liste:', error);
      return res.status(404).json({ error: error.message });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Erreur lors de la récupération de la liste:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la liste' });
  }
});

// POST create list with file upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { type, nom } = req.body;
    const file = req.file;

    if (!type || !nom || !file) {
      return res.status(400).json({ 
        error: 'type, nom et fichier sont requis' 
      });
    }

    // Compter le nombre de lignes dans le fichier CSV
    let elements = 0;
    try {
      const fileContent = fs.readFileSync(file.path, 'utf8');
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');
      elements = lines.length - 1; // Soustraire l'en-tête
    } catch (err) {
      console.error('Erreur lors du comptage des lignes:', err);
      elements = 0;
    }

    // Créer l'enregistrement dans la base de données
    const dbInput = {
      type,
      nom,
      elements: Math.max(0, elements),
      path: `/public/list/${file.filename}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('liste')
      .insert(dbInput)
      .select('*')
      .single();

    if (error) {
      console.error('Erreur lors de l\'insertion de la liste:', error);
      // Supprimer le fichier si l'insertion échoue
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      ...data,
      filePath: dbInput.path,
      originalName: file.originalname
    });

  } catch (err) {
    console.error('Erreur lors de la création de la liste:', err);
    // Supprimer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Erreur lors de la création de la liste' });
  }
});

// PUT update list
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const input = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('liste')
      .update(input)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la liste:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la liste:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la liste' });
  }
});

// DELETE list
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer les informations de la liste avant suppression
    const { data: listData, error: fetchError } = await supabase
      .from('liste')
      .select('path')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Erreur lors de la récupération de la liste:', fetchError);
      return res.status(404).json({ error: fetchError.message });
    }

    // Supprimer l'enregistrement de la base de données
    const { error } = await supabase
      .from('liste')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression de la liste:', error);
      return res.status(400).json({ error: error.message });
    }

    // Supprimer le fichier physique
    if (listData && listData.path) {
      const filePath = path.join(__dirname, '../..', listData.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(204).send();
  } catch (err) {
    console.error('Erreur lors de la suppression de la liste:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la liste' });
  }
});

// GET download list file
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('liste')
      .select('path, nom')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération de la liste:', error);
      return res.status(404).json({ error: error.message });
    }

    const filePath = path.join(__dirname, '../..', data.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Déterminer le nom du fichier pour le téléchargement
    const fileName = `${data.nom}.csv`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'text/csv');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (err) {
    console.error('Erreur lors du téléchargement de la liste:', err);
    res.status(500).json({ error: 'Erreur lors du téléchargement de la liste' });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const parse = require('csv-parse/lib/sync');

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

// GET all lists (import)
router.get('/import', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('liste')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des listes (import):', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Erreur lors de la récupération des listes (import):', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des listes (import)' });
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

// POST create list from selected businesses
router.post('/create-from-selection', async (req, res) => {
  try {
    const { nom, selectedBusinesses } = req.body;

    if (!nom || !selectedBusinesses || !Array.isArray(selectedBusinesses)) {
      return res.status(400).json({ 
        error: 'nom et selectedBusinesses (array) sont requis' 
      });
    }

    if (selectedBusinesses.length === 0) {
      return res.status(400).json({ 
        error: 'Aucune entreprise sélectionnée' 
      });
    }

    // Créer le contenu CSV
    const csvHeaders = [
      'Nom',
      'Activité',
      'Ville',
      'Adresse',
      'Code Postal',
      'Téléphone',
      'Forme Juridique',
      'Description',
      'Année de création',
      'Nombre d\'employés',
      'Chiffre d\'affaires',
      'SIREN'
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...selectedBusinesses.map(business => [
        business.name || business.nom_complet || '',
        business.activity || business.activite_principale || '',
        business.city || business.siege?.libelle_commune || '',
        business.address || business.siege?.geo_adresse || '',
        business.postalCode || business.siege?.code_postal || '',
        business.phone || '',
        business.legalForm || business.nature_juridique || '',
        business.description || '',
        business.foundedYear || '',
        business.employeeCount || business.tranche_effectif_salarie || '',
        business.revenue || '',
        business.siren || business.id || ''
      ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    const filename = `export_${timestamp}_${randomDigits}.csv`;
    const filePath = path.join(__dirname, '../../public/list', filename);

    // Créer le dossier s'il n'existe pas
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Écrire le fichier CSV
    fs.writeFileSync(filePath, csvContent, 'utf8');

    // Créer l'enregistrement dans la base de données
    const dbInput = {
      type: 'Entreprise',
      nom,
      elements: selectedBusinesses.length,
      path: `/public/list/${filename}`,
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
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      ...data,
      filePath: dbInput.path,
      elements: selectedBusinesses.length
    });

  } catch (err) {
    console.error('Erreur lors de la création de la liste depuis la sélection:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la liste' });
  }
});

// POST import lists (insertion directe dans la table 'liste')
router.post('/import', async (req, res) => {
  try {
    let lists = req.body.lists;
    if (!Array.isArray(lists)) {
      lists = [req.body];
    }
    for (const l of lists) {
      if (!l.type || !l.nom || typeof l.elements !== 'number' || !l.path) {
        return res.status(400).json({ error: 'Chaque liste doit avoir type, nom, elements (number) et path' });
      }
    }
    const dbInputs = lists.map(l => ({
      type: l.type,
      nom: l.nom,
      elements: l.elements,
      path: l.path,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    const { data, error } = await supabase.from('liste').insert(dbInputs).select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    console.error('Erreur lors de l\'importation de listes:', err);
    res.status(500).json({ error: 'Erreur lors de l\'importation de listes' });
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

// GET CSV content by list id
router.get('/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    // Récupérer la liste pour obtenir le chemin du fichier
    const { data, error } = await supabase
      .from('liste')
      .select('path')
      .eq('id', id)
      .single();
    if (error || !data) {
      return res.status(404).json({ error: 'Liste non trouvée' });
    }
    const filePath = path.join(__dirname, '../..', data.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier CSV non trouvé' });
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // Parser le CSV en JSON
    let records;
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        delimiter: '\t',
        relax_column_count: true,
        relax_quotes: true,
        skip_records_with_error: true,
        relax: true
      });
    } catch (err) {
      console.error('Erreur détaillée parsing CSV:', err);
      return res.status(500).json({ error: 'Erreur lors du parsing du CSV', details: err && err.message ? err.message : err });
    }
    res.json(records);
  } catch (err) {
    console.error('Erreur lors de la lecture du contenu CSV:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET only the first column of the CSV by list id
router.get('/:id/first-column', async (req, res) => {
  try {
    const { id } = req.params;
    // Récupérer la liste pour obtenir le chemin du fichier
    const { data, error } = await supabase
      .from('liste')
      .select('path')
      .eq('id', id)
      .single();
    if (error || !data) {
      return res.status(404).json({ error: 'Liste non trouvée' });
    }
    const filePath = path.join(__dirname, '../..', data.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier CSV non trouvé' });
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // Parser le CSV en JSON
    let records;
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        delimiter: '\t',
        relax_column_count: true,
        relax_quotes: true,
        skip_records_with_error: true,
        relax: true
      });
    } catch (err) {
      console.error('Erreur détaillée parsing CSV:', err);
      return res.status(500).json({ error: 'Erreur lors du parsing du CSV', details: err && err.message ? err.message : err });
    }
    // Récupérer le nom de la première colonne
    const firstColName = records.length > 0 ? Object.keys(records[0])[0] : null;
    if (!firstColName) {
      return res.json([]);
    }
    // Extraire uniquement la première colonne
    const firstColValues = records.map(row => row[firstColName]);
    res.json(firstColValues);
  } catch (err) {
    console.error('Erreur lors de la lecture de la première colonne du CSV:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router; 
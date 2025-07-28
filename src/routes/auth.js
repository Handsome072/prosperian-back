const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * @route POST /api/auth/register
 * @desc Enregistrer un nouvel utilisateur
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, mot_de_passe, prenom, nom, telephone, role = 'user' } = req.body;

    // Validation des champs requis
    if (!email || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        error: 'Champs manquants',
        message: 'Email et mot de passe sont requis'
      });
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email invalide',
        message: 'Veuillez fournir un email valide'
      });
    }

    // Validation de la force du mot de passe
    if (mot_de_passe.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe trop faible',
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    console.log('🔐 Tentative d\'inscription pour:', email);

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: checkError } = await supabase
      .from('utilisateur')
      .select('id, email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification de l\'utilisateur:', checkError);
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        message: 'Erreur lors de la vérification de l\'utilisateur'
      });
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Utilisateur existant',
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

    // Préparer les données utilisateur
    const userData = {
      email: email.toLowerCase().trim(),
      mot_de_passe: hashedPassword,
      prenom: prenom ? prenom.trim() : null,
      nom: nom ? nom.trim() : null,
      telephone: telephone ? telephone.trim() : null,
      role: role,
      date_creation: new Date().toISOString()
    };

    // Insérer l'utilisateur dans la base de données
    const { data: newUser, error: insertError } = await supabase
      .from('utilisateur')
      .insert([userData])
      .select('id, email, prenom, nom, telephone, role, date_creation')
      .single();

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion de l\'utilisateur:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        message: 'Erreur lors de la création du compte'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('✅ Utilisateur créé avec succès:', newUser.email);

    // Retourner la réponse
    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: newUser.id,
        email: newUser.email,
        prenom: newUser.prenom,
        nom: newUser.nom,
        telephone: newUser.telephone,
        role: newUser.role,
        date_creation: newUser.date_creation
      },
      token: token,
      expiresIn: JWT_EXPIRES_IN
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la création du compte'
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Connecter un utilisateur
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Validation des champs requis
    if (!email || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        error: 'Champs manquants',
        message: 'Email et mot de passe sont requis'
      });
    }

    console.log('🔐 Tentative de connexion pour:', email);

    // Rechercher l'utilisateur par email
    const { data: user, error: fetchError } = await supabase
      .from('utilisateur')
      .select('id, email, mot_de_passe, prenom, nom, telephone, role, date_creation')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        message: 'Erreur lors de la connexion'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('✅ Connexion réussie pour:', user.email);

    // Retourner la réponse
    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
        telephone: user.telephone,
        role: user.role,
        date_creation: user.date_creation
      },
      token: token,
      expiresIn: JWT_EXPIRES_IN
    });

  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la connexion'
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Récupérer les informations de l'utilisateur connecté
 * @access Private
 */
router.get('/me', async (req, res) => {
  try {
    // Récupérer le token depuis les headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token manquant',
        message: 'Token d\'authentification requis'
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Récupérer les informations utilisateur
    const { data: user, error: fetchError } = await supabase
      .from('utilisateur')
      .select('id, email, prenom, nom, telephone, role, date_creation')
      .eq('id', decoded.userId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        message: 'Utilisateur introuvable'
      });
    }

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token invalide',
        message: 'Token d\'authentification invalide'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expiré',
        message: 'Token d\'authentification expiré'
      });
    }

    console.error('❌ Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Rafraîchir le token JWT
 * @access Private
 */
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token manquant',
        message: 'Token d\'authentification requis'
      });
    }

    const token = authHeader.substring(7);

    // Vérifier le token (même s'il est expiré)
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

    // Vérifier que l'utilisateur existe toujours
    const { data: user, error: fetchError } = await supabase
      .from('utilisateur')
      .select('id, email, role')
      .eq('id', decoded.userId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        message: 'Utilisateur introuvable'
      });
    }

    // Générer un nouveau token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Token rafraîchi avec succès',
      token: newToken,
      expiresIn: JWT_EXPIRES_IN
    });

  } catch (error) {
    console.error('❌ Erreur lors du rafraîchissement du token:', error);
    res.status(401).json({
      success: false,
      error: 'Token invalide',
      message: 'Impossible de rafraîchir le token'
    });
  }
});

module.exports = router; 
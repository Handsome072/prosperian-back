const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware d'authentification pour vérifier les tokens JWT
 */
const authenticateToken = async (req, res, next) => {
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

    // Vérifier que l'utilisateur existe toujours dans la base de données
    const { data: user, error: fetchError } = await supabase
      .from('utilisateur')
      .select('id, email, prenom, nom, telephone, role, date_creation')
      .eq('id', decoded.userId)
      .single();

    if (fetchError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé',
        message: 'Utilisateur introuvable ou token invalide'
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();

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

    console.error('❌ Erreur d\'authentification:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de l\'authentification'
    });
  }
};

/**
 * Middleware pour vérifier les rôles utilisateur
 * @param {string|string[]} roles - Rôle(s) autorisé(s)
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Non authentifié',
        message: 'Authentification requise'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions nécessaires pour cette action'
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier si l'utilisateur est propriétaire de la ressource
 * @param {string} resourceUserIdField - Champ contenant l'ID utilisateur dans la ressource
 */
const authorizeOwner = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Non authentifié',
        message: 'Authentification requise'
      });
    }

    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur manquant',
        message: 'Impossible de déterminer le propriétaire de la ressource'
      });
    }

    // Les admins peuvent accéder à toutes les ressources
    if (req.user.role === 'admin') {
      return next();
    }

    // Vérifier si l'utilisateur est propriétaire de la ressource
    if (resourceUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
        message: 'Vous n\'êtes pas autorisé à accéder à cette ressource'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeOwner
}; 
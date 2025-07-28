const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { authenticateToken, authorizeRoles, authorizeOwner } = require('../middleware/auth');

/**
 * @route GET /api/utilisateur/profile
 * @desc Récupérer le profil de l'utilisateur connecté
 * @access Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('utilisateur')
      .select('id, email, prenom, nom, telephone, role, date_creation')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        message: 'Erreur lors de la récupération du profil'
      });
    }

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

/**
 * @route PUT /api/utilisateur/profile
 * @desc Mettre à jour le profil de l'utilisateur connecté
 * @access Private
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { prenom, nom, telephone } = req.body;

    // Préparer les données à mettre à jour
    const updateData = {};
    if (prenom !== undefined) updateData.prenom = prenom.trim();
    if (nom !== undefined) updateData.nom = nom.trim();
    if (telephone !== undefined) updateData.telephone = telephone.trim();

    // Vérifier qu'au moins un champ est fourni
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        message: 'Aucune donnée à mettre à jour'
      });
    }

    const { data: updatedUser, error } = await supabase
      .from('utilisateur')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, email, prenom, nom, telephone, role, date_creation')
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        message: 'Erreur lors de la mise à jour du profil'
      });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

/**
 * @route PUT /api/utilisateur/password
 * @desc Changer le mot de passe de l'utilisateur connecté
 * @access Private
 */
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        message: 'Ancien et nouveau mot de passe requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe trop faible',
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Récupérer le mot de passe actuel
    const { data: user, error: fetchError } = await supabase
      .from('utilisateur')
      .select('mot_de_passe')
      .eq('id', req.user.id)
      .single();

    if (fetchError) {
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        message: 'Erreur lors de la vérification du mot de passe'
      });
    }

    // Vérifier l'ancien mot de passe
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.mot_de_passe);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe incorrect',
        message: 'L\'ancien mot de passe est incorrect'
      });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase
      .from('utilisateur')
      .update({ mot_de_passe: hashedNewPassword })
      .eq('id', req.user.id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        message: 'Erreur lors du changement de mot de passe'
      });
    }

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors du changement de mot de passe'
    });
  }
});

/**
 * @route GET /api/utilisateur
 * @desc Récupérer tous les utilisateurs (admin seulement)
 * @access Private - Admin
 */
router.get('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('utilisateur')
      .select('id, email, prenom, nom, telephone, role, date_creation')
      .order('date_creation', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        message: 'Erreur lors de la récupération des utilisateurs'
      });
    }

    res.json({
      success: true,
      users: users,
      total: users.length
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

/**
 * @route GET /api/utilisateur/:id
 * @desc Récupérer un utilisateur par ID (admin ou propriétaire)
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
        message: 'Vous n\'êtes pas autorisé à accéder à ce profil'
      });
    }

    const { data: user, error } = await supabase
      .from('utilisateur')
      .select('id, email, prenom, nom, telephone, role, date_creation')
      .eq('id', id)
      .single();

    if (error) {
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
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
});

/**
 * @route PUT /api/utilisateur/:id
 * @desc Mettre à jour un utilisateur (admin ou propriétaire)
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { prenom, nom, telephone, role } = req.body;

    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
        message: 'Vous n\'êtes pas autorisé à modifier ce profil'
      });
    }

    // Seuls les admins peuvent changer les rôles
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
        message: 'Seuls les administrateurs peuvent modifier les rôles'
      });
    }

    // Préparer les données à mettre à jour
    const updateData = {};
    if (prenom !== undefined) updateData.prenom = prenom.trim();
    if (nom !== undefined) updateData.nom = nom.trim();
    if (telephone !== undefined) updateData.telephone = telephone.trim();
    if (role && req.user.role === 'admin') updateData.role = role;

    // Vérifier qu'au moins un champ est fourni
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        message: 'Aucune donnée à mettre à jour'
      });
    }

    const { data: updatedUser, error } = await supabase
      .from('utilisateur')
      .update(updateData)
      .eq('id', id)
      .select('id, email, prenom, nom, telephone, role, date_creation')
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        message: 'Erreur lors de la mise à jour de l\'utilisateur'
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la mise à jour de l\'utilisateur'
    });
  }
});

/**
 * @route DELETE /api/utilisateur/:id
 * @desc Supprimer un utilisateur (admin seulement)
 * @access Private - Admin
 */
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher la suppression de son propre compte
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'Suppression interdite',
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    const { error } = await supabase
      .from('utilisateur')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        message: 'Erreur lors de la suppression de l\'utilisateur'
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
});

module.exports = router; 
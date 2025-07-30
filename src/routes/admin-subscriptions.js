const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminSubscription:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         monthly_credits:
 *           type: integer
 *         price:
 *           type: number
 *         stripe_price_id:
 *           type: string
 *         description:
 *           type: string
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *     AdminCreditPack:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         credits:
 *           type: integer
 *         price:
 *           type: number
 *         stripe_price_id:
 *           type: string
 *         description:
 *           type: string
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 */

/**
 * @swagger
 * /api/subscription:
 *   get:
 *     summary: Récupérer tous les abonnements (admin)
 *     tags: [Admin Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des abonnements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminSubscription'
 */
router.get('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des abonnements',
        message: error.message
      });
    }

    res.json(subscriptions);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des abonnements:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des abonnements'
    });
  }
});

/**
 * @swagger
 * /api/subscription:
 *   post:
 *     summary: Créer un nouvel abonnement (admin)
 *     tags: [Admin Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - monthly_credits
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               monthly_credits:
 *                 type: integer
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               stripe_price_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Abonnement créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSubscription'
 */
router.post('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { name, monthly_credits, price, description, stripe_price_id } = req.body;

    if (!name || !monthly_credits || !price) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        message: 'Nom, crédits mensuels et prix sont requis'
      });
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        name: name.trim(),
        monthly_credits: parseInt(monthly_credits),
        price: parseFloat(price),
        description: description?.trim(),
        stripe_price_id: stripe_price_id?.trim()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création de l\'abonnement',
        message: error.message
      });
    }

    res.status(201).json(subscription);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'abonnement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la création de l\'abonnement'
    });
  }
});

/**
 * @swagger
 * /api/subscription/{id}:
 *   put:
 *     summary: Mettre à jour un abonnement (admin)
 *     tags: [Admin Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               monthly_credits:
 *                 type: integer
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               stripe_price_id:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Abonnement mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSubscription'
 */
router.put('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, monthly_credits, price, description, stripe_price_id, is_active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (monthly_credits !== undefined) updateData.monthly_credits = parseInt(monthly_credits);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description?.trim();
    if (stripe_price_id !== undefined) updateData.stripe_price_id = stripe_price_id?.trim();
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour de l\'abonnement',
        message: error.message
      });
    }

    res.json(subscription);

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'abonnement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la mise à jour de l\'abonnement'
    });
  }
});

/**
 * @swagger
 * /api/subscription/{id}:
 *   delete:
 *     summary: Supprimer un abonnement (admin)
 *     tags: [Admin Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Abonnement supprimé
 */
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression de l\'abonnement',
        message: error.message
      });
    }

    res.status(204).send();

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'abonnement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la suppression de l\'abonnement'
    });
  }
});

/**
 * @swagger
 * /api/subscription/stats:
 *   get:
 *     summary: Récupérer les statistiques des abonnements (admin)
 *     tags: [Admin Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des abonnements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total_subscriptions:
 *                       type: integer
 *                     active_subscriptions:
 *                       type: integer
 *                     total_revenue:
 *                       type: number
 *                     monthly_revenue:
 *                       type: number
 */
router.get('/stats', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    // Statistiques des abonnements
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*');

    if (subsError) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
        message: subsError.message
      });
    }

    // Statistiques des abonnements utilisateurs
    const { data: userSubscriptions, error: userSubsError } = await supabase
      .from('user_subscriptions')
      .select('*');

    if (userSubsError) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
        message: userSubsError.message
      });
    }

    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = userSubscriptions.filter(sub => sub.status === 'active').length;
    
    // Calcul du revenu total (simplifié)
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    const monthlyRevenue = userSubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => {
        const subscription = subscriptions.find(s => s.id === sub.subscription_id);
        return sum + (subscription?.price || 0);
      }, 0);

    res.json({
      success: true,
      stats: {
        total_subscriptions: totalSubscriptions,
        active_subscriptions: activeSubscriptions,
        total_revenue: totalRevenue,
        monthly_revenue: monthlyRevenue
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * /api/user-subscriptions:
 *   get:
 *     summary: Récupérer tous les abonnements utilisateurs (admin)
 *     tags: [Admin User Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des abonnements utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 subscriptions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                       subscription_id:
 *                         type: string
 *                       status:
 *                         type: string
 *                       current_period_start:
 *                         type: string
 *                       current_period_end:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                           prenom:
 *                             type: string
 *                           nom:
 *                             type: string
 *                       subscriptions:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           monthly_credits:
 *                             type: integer
 *                           price:
 *                             type: number
 */
router.get('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { data: userSubscriptions, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        user:utilisateur(email, prenom, nom),
        subscriptions(name, monthly_credits, price)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des abonnements utilisateurs',
        message: error.message
      });
    }

    res.json({
      success: true,
      subscriptions: userSubscriptions
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des abonnements utilisateurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des abonnements utilisateurs'
    });
  }
});

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Récupérer toutes les transactions (admin)
 *     tags: [Admin Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                       pack_id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       credits:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       type:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                           prenom:
 *                             type: string
 *                           nom:
 *                             type: string
 *                       credit_packs:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           credits:
 *                             type: integer
 *                           price:
 *                             type: number
 */
router.get('/transactions', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        user:utilisateur(email, prenom, nom),
        credit_packs(name, credits, price)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des transactions',
        message: error.message
      });
    }

    res.json({
      success: true,
      transactions: transactions
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des transactions'
    });
  }
});

module.exports = router; 
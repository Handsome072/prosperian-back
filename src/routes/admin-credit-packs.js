const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * /api/credit-packs:
 *   get:
 *     summary: Récupérer tous les packs de crédits (admin)
 *     tags: [Admin Credit Packs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des packs de crédits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminCreditPack'
 */
router.get('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { data: creditPacks, error } = await supabase
      .from('credit_packs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des packs de crédits',
        message: error.message
      });
    }

    res.json(creditPacks);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des packs de crédits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des packs de crédits'
    });
  }
});

/**
 * @swagger
 * /api/credit-packs:
 *   post:
 *     summary: Créer un nouveau pack de crédits (admin)
 *     tags: [Admin Credit Packs]
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
 *               - credits
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               credits:
 *                 type: integer
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               stripe_price_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pack de crédits créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminCreditPack'
 */
router.post('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { name, credits, price, description, stripe_price_id } = req.body;

    if (!name || !credits || !price) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        message: 'Nom, crédits et prix sont requis'
      });
    }

    const { data: creditPack, error } = await supabase
      .from('credit_packs')
      .insert({
        name: name.trim(),
        credits: parseInt(credits),
        price: parseFloat(price),
        description: description?.trim(),
        stripe_price_id: stripe_price_id?.trim()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du pack de crédits',
        message: error.message
      });
    }

    res.status(201).json(creditPack);

  } catch (error) {
    console.error('❌ Erreur lors de la création du pack de crédits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la création du pack de crédits'
    });
  }
});

/**
 * @swagger
 * /api/credit-packs/{id}:
 *   put:
 *     summary: Mettre à jour un pack de crédits (admin)
 *     tags: [Admin Credit Packs]
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
 *               credits:
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
 *         description: Pack de crédits mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminCreditPack'
 */
router.put('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, credits, price, description, stripe_price_id, is_active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (credits !== undefined) updateData.credits = parseInt(credits);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description?.trim();
    if (stripe_price_id !== undefined) updateData.stripe_price_id = stripe_price_id?.trim();
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: creditPack, error } = await supabase
      .from('credit_packs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour du pack de crédits',
        message: error.message
      });
    }

    res.json(creditPack);

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du pack de crédits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la mise à jour du pack de crédits'
    });
  }
});

/**
 * @swagger
 * /api/credit-packs/{id}:
 *   delete:
 *     summary: Supprimer un pack de crédits (admin)
 *     tags: [Admin Credit Packs]
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
 *         description: Pack de crédits supprimé
 */
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('credit_packs')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression du pack de crédits',
        message: error.message
      });
    }

    res.status(204).send();

  } catch (error) {
    console.error('❌ Erreur lors de la suppression du pack de crédits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la suppression du pack de crédits'
    });
  }
});

module.exports = router; 
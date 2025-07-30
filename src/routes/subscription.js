const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/subscription:
 *   get:
 *     summary: Récupérer tous les abonnements disponibles
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: Liste des abonnements
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
 *                       name:
 *                         type: string
 *                       monthly_credits:
 *                         type: integer
 *                       price:
 *                         type: number
 *                       description:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 */
router.get('/', async (req, res) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des abonnements',
        message: error.message
      });
    }

    res.json({
      success: true,
      subscriptions: subscriptions
    });

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
 * /api/subscription/{id}:
 *   get:
 *     summary: Récupérer un abonnement par ID
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'abonnement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 subscription:
 *                   type: object
 */
router.get('/:id', async (req, res) => {
  try {
  const { id } = req.params;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !subscription) {
      return res.status(404).json({
        success: false,
        error: 'Abonnement non trouvé',
        message: 'L\'abonnement demandé n\'existe pas ou n\'est pas actif'
      });
    }

    res.json({
      success: true,
      subscription: subscription
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'abonnement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération de l\'abonnement'
    });
  }
});

/**
 * @swagger
 * /api/subscription:
 *   post:
 *     summary: Créer un nouvel abonnement avec Stripe
 *     tags: [Subscription]
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
 *     responses:
 *       201:
 *         description: Abonnement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 subscription:
 *                   type: object
 *                 stripe_price:
 *                   type: object
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, monthly_credits, price, description } = req.body;

    if (!name || !monthly_credits || !price) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        message: 'Nom, crédits mensuels et prix sont requis'
      });
    }

    // Créer le produit Stripe
    const stripeProduct = await stripe.products.create({
      name: name,
      description: description || `Abonnement ${name}`,
      metadata: {
        type: 'subscription',
        monthly_credits: monthly_credits.toString()
      }
    });

    // Créer le prix Stripe (récurent mensuel)
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100), // Stripe utilise les centimes
      currency: 'eur',
      recurring: {
        interval: 'month'
      },
      metadata: {
        monthly_credits: monthly_credits.toString()
      }
    });

    // Créer l'abonnement dans la base de données
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        name: name.trim(),
        monthly_credits: parseInt(monthly_credits),
        price: parseFloat(price),
        description: description?.trim(),
        stripe_price_id: stripePrice.id,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      // Supprimer le produit et prix Stripe en cas d'erreur
      await stripe.prices.del(stripePrice.id);
      await stripe.products.del(stripeProduct.id);
      
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création de l\'abonnement',
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      subscription: subscription,
      stripe_price: {
        id: stripePrice.id,
        product_id: stripeProduct.id
      }
    });

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
 *     summary: Mettre à jour un abonnement
 *     tags: [Subscription]
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
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Abonnement mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 subscription:
 *                   type: object
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
  const { id } = req.params;
    const { name, monthly_credits, price, description, is_active } = req.body;

    // Récupérer l'abonnement existant
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingSubscription) {
      return res.status(404).json({
        success: false,
        error: 'Abonnement non trouvé',
        message: 'L\'abonnement demandé n\'existe pas'
      });
    }

    // Préparer les données de mise à jour
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (monthly_credits !== undefined) updateData.monthly_credits = parseInt(monthly_credits);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description?.trim();
    if (is_active !== undefined) updateData.is_active = is_active;

    // Si le prix ou les crédits ont changé et qu'il y a un stripe_price_id, créer un nouveau prix Stripe
    if ((price !== undefined && price !== existingSubscription.price) || 
        (monthly_credits !== undefined && monthly_credits !== existingSubscription.monthly_credits)) {
      
      if (existingSubscription.stripe_price_id) {
        // Désactiver l'ancien prix Stripe
        await stripe.prices.update(existingSubscription.stripe_price_id, {
          active: false
        });
      }

      // Créer un nouveau prix Stripe
      const stripePrice = await stripe.prices.create({
        product: existingSubscription.stripe_price_id ? 
          (await stripe.prices.retrieve(existingSubscription.stripe_price_id)).product : 
          'prod_default', // Vous devrez gérer la création du produit si nécessaire
        unit_amount: Math.round((price !== undefined ? price : existingSubscription.price) * 100),
        currency: 'eur',
        recurring: {
          interval: 'month'
        },
        metadata: {
          monthly_credits: (monthly_credits !== undefined ? monthly_credits : existingSubscription.monthly_credits).toString()
        }
      });

      updateData.stripe_price_id = stripePrice.id;
    }

    // Mettre à jour l'abonnement dans la base de données
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

    res.json({
      success: true,
      subscription: subscription
    });

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
 *     summary: Supprimer un abonnement
 *     tags: [Subscription]
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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
  const { id } = req.params;

    // Récupérer l'abonnement pour obtenir le stripe_price_id
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('stripe_price_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        error: 'Abonnement non trouvé',
        message: 'L\'abonnement demandé n\'existe pas'
      });
    }

    // Supprimer l'abonnement de la base de données
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

    // Désactiver le prix Stripe si il existe
    if (subscription.stripe_price_id) {
      try {
        await stripe.prices.update(subscription.stripe_price_id, {
          active: false
        });
      } catch (stripeError) {
        console.error('Erreur lors de la désactivation du prix Stripe:', stripeError);
        // On continue même si la désactivation Stripe échoue
      }
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
 * /api/subscription/credit-packs:
 *   post:
 *     summary: Créer un nouveau pack de crédits avec Stripe
 *     tags: [Subscription]
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
 *     responses:
 *       201:
 *         description: Pack de crédits créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 credit_pack:
 *                   type: object
 *                 stripe_price:
 *                   type: object
 */
router.post('/credit-packs', authenticateToken, async (req, res) => {
  try {
    const { name, credits, price, description } = req.body;

    if (!name || !credits || !price) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        message: 'Nom, crédits et prix sont requis'
      });
    }

    // Créer le produit Stripe
    const stripeProduct = await stripe.products.create({
      name: name,
      description: description || `Pack de crédits ${name}`,
      metadata: {
        type: 'credit_pack',
        credits: credits.toString()
      }
    });

    // Créer le prix Stripe (paiement unique)
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100), // Stripe utilise les centimes
      currency: 'eur',
      metadata: {
        credits: credits.toString()
      }
    });

    // Créer le pack de crédits dans la base de données
    const { data: creditPack, error } = await supabase
      .from('credit_packs')
      .insert({
        name: name.trim(),
        credits: parseInt(credits),
        price: parseFloat(price),
        description: description?.trim(),
        stripe_price_id: stripePrice.id,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      // Supprimer le produit et prix Stripe en cas d'erreur
      await stripe.prices.del(stripePrice.id);
      await stripe.products.del(stripeProduct.id);
      
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du pack de crédits',
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      credit_pack: creditPack,
      stripe_price: {
        id: stripePrice.id,
        product_id: stripeProduct.id
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du pack de crédits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la création du pack de crédits'
    });
  }
});

module.exports = router; 
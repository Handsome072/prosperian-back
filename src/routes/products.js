const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Récupérer tous les produits actifs et leurs prix depuis Stripe
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Liste des produits avec leurs prix
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       active:
 *                         type: boolean
 *                       prices:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             unit_amount:
 *                               type: number
 *                             currency:
 *                               type: string
 *                             recurring:
 *                               type: object
 *                             active:
 *                               type: boolean
 */
router.get('/', async (req, res) => {
  try {
    // Récupérer tous les produits actifs
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    });

    // Pour chaque produit, récupérer tous les prix actifs
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
          type: 'recurring'
        });

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          active: product.active,
          metadata: product.metadata,
          prices: prices.data.map(price => ({
            id: price.id,
            unit_amount: price.unit_amount,
            currency: price.currency,
            recurring: price.recurring,
            active: price.active,
            metadata: price.metadata
          }))
        };
      })
    );

    res.json({
      success: true,
      products: productsWithPrices
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des produits'
    });
  }
});

/**
 * @swagger
 * /api/create-checkout-session:
 *   post:
 *     summary: Créer une session Stripe Checkout pour un abonnement
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priceId:
 *                 type: string
 *                 description: ID du prix Stripe
 *               successUrl:
 *                 type: string
 *                 description: URL de redirection en cas de succès
 *               cancelUrl:
 *                 type: string
 *                 description: URL de redirection en cas d'annulation
 *     responses:
 *       200:
 *         description: Session de checkout créée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessionId:
 *                   type: string
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({
        success: false,
        error: 'priceId est requis'
      });
    }

    // Vérifier que le prix existe et est actif
    const price = await stripe.prices.retrieve(priceId);
    if (!price.active) {
      return res.status(400).json({
        success: false,
        error: 'Prix non actif'
      });
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    res.json({
      success: true,
      sessionId: session.id
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de la session de checkout:', error);
    console.error('❌ Détails de l\'erreur:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    });
    
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message || 'Erreur lors de la création de la session de checkout',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 
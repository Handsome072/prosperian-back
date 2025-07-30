const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     CreditPack:
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
 *     Subscription:
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
 *     PaymentIntent:
 *       type: object
 *       properties:
 *         client_secret:
 *           type: string
 *         amount:
 *           type: integer
 *         currency:
 *           type: string
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /api/payment/credit-packs:
 *   get:
 *     summary: Récupérer tous les packs de crédits disponibles
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Liste des packs de crédits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 credit_packs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CreditPack'
 */
router.get('/credit-packs', async (req, res) => {
  try {
    const { data: creditPacks, error } = await supabase
      .from('credit_packs')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des packs de crédits',
        message: error.message
      });
    }

    res.json({
      success: true,
      credit_packs: creditPacks
    });

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
 * /api/payment/subscriptions:
 *   get:
 *     summary: Récupérer tous les abonnements disponibles
 *     tags: [Payment]
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
 *                     $ref: '#/components/schemas/Subscription'
 */
router.get('/subscriptions', async (req, res) => {
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
 * /api/payment/create-payment-intent:
 *   post:
 *     summary: Créer une intention de paiement pour un pack de crédits
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pack_id
 *             properties:
 *               pack_id:
 *                 type: string
 *                 description: ID du pack de crédits
 *     responses:
 *       200:
 *         description: Intention de paiement créée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 client_secret:
 *                   type: string
 *                 payment_intent:
 *                   $ref: '#/components/schemas/PaymentIntent'
 */
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { pack_id } = req.body;
    const userId = req.user.id;

    if (!pack_id) {
      return res.status(400).json({
        success: false,
        error: 'Pack ID requis',
        message: 'L\'ID du pack de crédits est requis'
      });
    }

    // Récupérer les informations du pack
    const { data: pack, error: packError } = await supabase
      .from('credit_packs')
      .select('*')
      .eq('id', pack_id)
      .eq('is_active', true)
      .single();

    if (packError || !pack) {
      return res.status(404).json({
        success: false,
        error: 'Pack non trouvé',
        message: 'Le pack de crédits demandé n\'existe pas ou n\'est pas actif'
      });
    }

    // Créer l'intention de paiement avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(pack.price * 100), // Stripe utilise les centimes
      currency: 'eur',
      metadata: {
        user_id: userId,
        pack_id: pack_id,
        pack_name: pack.name,
        credits: pack.credits.toString()
      }
    });

    // Enregistrer la transaction en attente
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        pack_id: pack_id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: pack.price,
        credits: pack.credits,
        status: 'pending',
        type: 'credit_pack'
      });

    if (transactionError) {
      console.error('Erreur lors de l\'enregistrement de la transaction:', transactionError);
    }

    res.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'intention de paiement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la création de l\'intention de paiement'
    });
  }
});

/**
 * @swagger
 * /api/payment/create-subscription:
 *   post:
 *     summary: Créer un abonnement récurrent
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscription_id
 *             properties:
 *               subscription_id:
 *                 type: string
 *                 description: ID de l'abonnement
 *     responses:
 *       200:
 *         description: Session de paiement créée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 session_id:
 *                   type: string
 */
router.post('/create-subscription', authenticateToken, async (req, res) => {
  try {
    const { subscription_id } = req.body;
    const userId = req.user.id;

    if (!subscription_id) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID requis',
        message: 'L\'ID de l\'abonnement est requis'
      });
    }

    // Récupérer les informations de l'abonnement
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscription_id)
      .eq('is_active', true)
      .single();

    if (subscriptionError || !subscription) {
      return res.status(404).json({
        success: false,
        error: 'Abonnement non trouvé',
        message: 'L\'abonnement demandé n\'existe pas ou n\'est pas actif'
      });
    }

    // Récupérer les informations de l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('utilisateur')
      .select('email, prenom, nom')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        message: 'Utilisateur introuvable'
      });
    }

    // Créer la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: subscription.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      customer_email: user.email,
      metadata: {
        user_id: userId,
        subscription_id: subscription_id,
        subscription_name: subscription.name
      }
    });

    res.json({
      success: true,
      session_id: session.id,
      checkout_url: session.url
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
 * /api/payment/webhook:
 *   post:
 *     summary: Webhook Stripe pour traiter les événements de paiement
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook traité avec succès
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Erreur de signature webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du webhook' });
  }
});

// Fonction pour gérer le succès d'un paiement de pack de crédits
async function handlePaymentIntentSucceeded(paymentIntent) {
  const { user_id, pack_id, credits } = paymentIntent.metadata;

  // Mettre à jour le statut de la transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (transactionError) {
    console.error('Erreur lors de la mise à jour de la transaction:', transactionError);
  }

  // Ajouter les crédits à l'utilisateur
  const { data: user, error: userError } = await supabase
    .from('utilisateur')
    .select('credits')
    .eq('id', user_id)
    .single();

  if (userError) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
    return;
  }

  const newCredits = (user.credits || 0) + parseInt(credits);

  const { error: updateError } = await supabase
    .from('utilisateur')
    .update({ credits: newCredits })
    .eq('id', user_id);

  if (updateError) {
    console.error('Erreur lors de l\'ajout des crédits:', updateError);
  }
}

// Fonction pour gérer le succès d'un paiement d'abonnement
async function handleInvoicePaymentSucceeded(invoice) {
  const subscription = invoice.subscription;
  const customer = invoice.customer;

  // Récupérer les métadonnées de la session
  const { data: session } = await stripe.checkout.sessions.list({
    subscription: subscription,
    limit: 1
  });

  if (session.data.length > 0) {
    const { user_id, subscription_id } = session.data[0].metadata;

    // Mettre à jour ou créer l'abonnement utilisateur
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user_id,
        subscription_id: subscription_id,
        stripe_subscription_id: subscription,
        stripe_customer_id: customer,
        status: 'active',
        current_period_start: new Date(invoice.period_start * 1000).toISOString(),
        current_period_end: new Date(invoice.period_end * 1000).toISOString()
      });

    if (subscriptionError) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', subscriptionError);
    }
  }
}

// Fonction pour gérer la suppression d'un abonnement
async function handleSubscriptionDeleted(subscription) {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
  }
}

/**
 * @swagger
 * /api/payment/user-credits:
 *   get:
 *     summary: Récupérer les crédits de l'utilisateur connecté
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Crédits de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 credits:
 *                   type: integer
 */
router.get('/user-credits', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('utilisateur')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des crédits',
        message: error.message
      });
    }

    res.json({
      success: true,
      credits: user.credits || 0
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des crédits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des crédits'
    });
  }
});

/**
 * @swagger
 * /api/payment/user-subscriptions:
 *   get:
 *     summary: Récupérer les abonnements de l'utilisateur connecté
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Abonnements de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 subscriptions:
 *                   type: array
 */
router.get('/user-subscriptions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: subscriptions, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscriptions (
          name,
          description,
          monthly_credits,
          price
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

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

module.exports = router; 
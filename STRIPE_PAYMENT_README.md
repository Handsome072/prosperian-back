# 💳 Système de Paiement Stripe - Prosperian Backend

Ce document décrit l'implémentation du système de paiement avec Stripe pour les packs de crédits et abonnements mensuels.

## 📋 Vue d'ensemble

Le système permet aux utilisateurs de :
- **Acheter des packs de crédits** (paiement unique)
- **Souscrire à des abonnements mensuels** (paiement récurrent)
- **Consulter leur solde de crédits**
- **Gérer leurs abonnements actifs**

## 🔧 Configuration

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51RqTHy9ngvtcjWJfe9MjppJChTTgBrKWF3hkS7KJ9HFsL5FpdEjceO5sdfFKPGAwoe6BFwEbNGGvkuAZX4YXYQmt002rQNCd2S
STRIPE_PUBLISHABLE_KEY=pk_test_51RqTHy9ngvtcjWJfJxILY6Tp7Yqn0AS534pJIrQ2QbnznazctiI20jA4pM6PVF9KIO5D6EqwohQpZYUKxvyEDCZf00aR1RL2eu
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici

# Frontend URL (pour les redirections)
FRONTEND_URL=http://localhost:5173
```

### Installation des dépendances

```bash
npm install stripe
```

## 🗄️ Structure de la Base de Données

### Tables créées

1. **`credit_packs`** - Packs de crédits disponibles
2. **`subscriptions`** - Abonnements mensuels disponibles
3. **`transactions`** - Historique des transactions
4. **`user_subscriptions`** - Abonnements actifs des utilisateurs
5. **`utilisateur.credits`** - Colonne ajoutée pour le solde de crédits

### Exécution du script SQL

Exécutez le fichier `database/payment_tables.sql` dans votre base de données Supabase :

```sql
-- Exécuter le script complet
\i database/payment_tables.sql
```

## 🚀 APIs Disponibles

### Base URL
```
http://localhost:4000/api/payment
```

## 📦 Packs de Crédits

### 1. Récupérer tous les packs de crédits

**Endpoint :** `GET /api/payment/credit-packs`

**Réponse de succès (200) :**
```json
{
  "success": true,
  "credit_packs": [
    {
      "id": "uuid",
      "name": "Pack Starter",
      "credits": 100,
      "price": 19.99,
      "stripe_price_id": "price_xxx",
      "description": "Pack de démarrage avec 100 crédits",
      "is_active": true
    }
  ]
}
```

### 2. Créer une intention de paiement

**Endpoint :** `POST /api/payment/create-payment-intent`

**Body :**
```json
{
  "pack_id": "uuid-du-pack"
}
```

**Réponse de succès (200) :**
```json
{
  "success": true,
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent": {
    "id": "pi_xxx",
    "amount": 1999,
    "currency": "eur",
    "status": "requires_payment_method"
  }
}
```

## 🔄 Abonnements

### 1. Récupérer tous les abonnements

**Endpoint :** `GET /api/payment/subscriptions`

**Réponse de succès (200) :**
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": "uuid",
      "name": "Abonnement Pro",
      "monthly_credits": 200,
      "price": 29.99,
      "stripe_price_id": "price_xxx",
      "description": "200 crédits par mois",
      "is_active": true
    }
  ]
}
```

### 2. Créer un abonnement

**Endpoint :** `POST /api/payment/create-subscription`

**Body :**
```json
{
  "subscription_id": "uuid-de-l-abonnement"
}
```

**Réponse de succès (200) :**
```json
{
  "success": true,
  "session_id": "cs_xxx",
  "checkout_url": "https://checkout.stripe.com/xxx"
}
```

## 👤 Informations Utilisateur

### 1. Récupérer les crédits de l'utilisateur

**Endpoint :** `GET /api/payment/user-credits`

**Réponse de succès (200) :**
```json
{
  "success": true,
  "credits": 150
}
```

### 2. Récupérer les abonnements de l'utilisateur

**Endpoint :** `GET /api/payment/user-subscriptions`

**Réponse de succès (200) :**
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": "uuid",
      "status": "active",
      "current_period_start": "2024-01-01T00:00:00.000Z",
      "current_period_end": "2024-02-01T00:00:00.000Z",
      "subscriptions": {
        "name": "Abonnement Pro",
        "monthly_credits": 200,
        "price": 29.99
      }
    }
  ]
}
```

## 🔗 Webhook Stripe

### Endpoint webhook

**URL :** `POST /api/payment/webhook`

**Événements gérés :**
- `payment_intent.succeeded` - Paiement de pack de crédits réussi
- `invoice.payment_succeeded` - Paiement d'abonnement réussi
- `customer.subscription.deleted` - Abonnement annulé

### Configuration du webhook dans Stripe

1. Allez dans le dashboard Stripe
2. Naviguez vers **Developers > Webhooks**
3. Cliquez sur **Add endpoint**
4. URL : `https://votre-domaine.com/api/payment/webhook`
5. Événements à sélectionner :
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
6. Copiez le **Signing secret** et ajoutez-le à `STRIPE_WEBHOOK_SECRET`

## 💳 Intégration Frontend

### 1. Packs de crédits (Elements)

```javascript
// 1. Créer l'intention de paiement
const response = await fetch('/api/payment/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ pack_id: 'uuid' })
});

const { client_secret } = await response.json();

// 2. Confirmer le paiement avec Stripe Elements
const { error } = await stripe.confirmCardPayment(client_secret, {
  payment_method: {
    card: elements.getElement('card'),
    billing_details: { name: 'Nom Utilisateur' }
  }
});
```

### 2. Abonnements (Checkout)

```javascript
// 1. Créer la session de paiement
const response = await fetch('/api/payment/create-subscription', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ subscription_id: 'uuid' })
});

const { checkout_url } = await response.json();

// 2. Rediriger vers Stripe Checkout
window.location.href = checkout_url;
```

## 📊 Données de Test

### Packs de crédits créés automatiquement :
- **Pack Starter** : 100 crédits - 19,99€
- **Pack Pro** : 500 crédits - 79,99€
- **Pack Business** : 1000 crédits - 149,99€
- **Pack Enterprise** : 2500 crédits - 299,99€

### Abonnements créés automatiquement :
- **Abonnement Starter** : 50 crédits/mois - 9,99€
- **Abonnement Pro** : 200 crédits/mois - 29,99€
- **Abonnement Business** : 500 crédits/mois - 59,99€
- **Abonnement Enterprise** : 1000 crédits/mois - 99,99€

## 🔒 Sécurité

### Authentification
- Toutes les routes de paiement nécessitent un token JWT valide
- Vérification des permissions utilisateur

### Validation
- Validation des données d'entrée
- Vérification de l'existence des packs/abonnements
- Protection contre les paiements en double

### Webhook
- Signature Stripe vérifiée
- Gestion des erreurs robuste
- Logs détaillés pour le debugging

## 🐛 Debugging

### Logs utiles
```javascript
// Dans les routes de paiement
console.log('❌ Erreur lors de la création de l\'intention de paiement:', error);

// Dans les webhooks
console.log('Événement reçu:', event.type);
console.log('Métadonnées:', event.data.object.metadata);
```

### Test des webhooks
Utilisez l'outil CLI Stripe pour tester les webhooks en local :

```bash
stripe listen --forward-to localhost:4000/api/payment/webhook
```

## 📈 Monitoring

### Métriques à surveiller
- Taux de conversion des paiements
- Taux d'échec des webhooks
- Temps de réponse des APIs
- Utilisation des crédits par utilisateur

### Alertes recommandées
- Échec de paiement > 5%
- Webhook non traité > 1 minute
- Erreur de base de données
- Crédits négatifs

## 🚀 Déploiement

### Production
1. Changer les clés Stripe vers les clés de production
2. Configurer le webhook avec l'URL de production
3. Tester les paiements en mode production
4. Monitorer les logs et métriques

### Variables d'environnement de production
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
FRONTEND_URL=https://votre-domaine.com
```

---

**Note :** Ce système est conçu pour être évolutif et peut facilement être étendu pour supporter d'autres types de paiements ou fonctionnalités. 
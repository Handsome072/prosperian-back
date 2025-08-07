# Prosperian API Backend

## Vue d'ensemble

API backend pour la plateforme Prosperian, offrant des services de prospection, enrichissement de données, et intégration avec diverses APIs externes.

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Démarrage en production
npm start
```

## 📚 Documentation des APIs

### APIs Principales

| Service | Documentation | Statut |
|---------|---------------|--------|
| **Pronto** | [PRONTO_API_README.md](./PRONTO_API_README.md) | ✅ Partiellement disponible |
| **Enrichissement** | [ENRICHMENT_API_README.md](./ENRICHMENT_API_README.md) | ✅ Disponible |
| **LinkedIn Sales** | [LINKEDIN_SALES_NAVIGATOR_README.md](./LINKEDIN_SALES_NAVIGATOR_README.md) | ✅ Disponible |
| **Authentification** | [AUTH_API_README.md](./AUTH_API_README.md) | ✅ Disponible |
| **Paiements Stripe** | [STRIPE_PAYMENT_README.md](./STRIPE_PAYMENT_README.md) | ✅ Disponible |

### APIs Utilitaires

| Service | Documentation | Description |
|---------|---------------|-------------|
| **Recherche Sémantique** | [SEMANTIC_SEARCH_README.md](./SEMANTIC_SEARCH_README.md) | Recherche intelligente d'entreprises |
| **Google My Business** | [GOOGLE_GMB_README.md](./GOOGLE_GMB_README.md) | Intégration Google Places |

## 🔧 Configuration

### Variables d'Environnement

```env
# Base de données Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# API Pronto
PRONTO_API_KEY=your_pronto_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# JWT
JWT_SECRET=your_jwt_secret
```

## 📊 Endpoints Principaux

### Pronto API
- `GET /api/pronto/searches` - Liste des recherches ✅
- `POST /api/pronto/lists` - Création de listes ✅
- `GET /api/pronto/status` - Statut des services ✅
- `POST /api/pronto/search-leads` - Recherche de leads ⚠️ Indisponible

### GraphQL
- `POST /graphql` - Endpoint GraphQL principal ✅

### Documentation
- `GET /api-docs` - Documentation Swagger ✅

## 🏗️ Architecture

```
src/
├── config/          # Configuration des APIs externes
├── middleware/      # Middlewares Express
├── resolvers/       # Resolvers GraphQL
├── routes/          # Routes Express
├── schema/          # Schémas GraphQL
└── swagger.js       # Configuration Swagger
```

## 🔍 Monitoring et Debug

### Vérification du Statut

```bash
# Statut général de l'API
curl http://localhost:4000/

# Statut des services Pronto
curl http://localhost:4000/api/pronto/status

# Diagnostic complet Pronto
curl http://localhost:4000/api/pronto-workflows/diagnostic
```

### Logs

Les logs sont affichés dans la console en mode développement avec des emojis pour faciliter le debug :

- 🚀 Démarrage de processus
- ✅ Succès
- ❌ Erreurs
- ⚠️ Avertissements
- 🔍 Recherches
- 📊 Données

## 🛠️ Développement

### Scripts Disponibles

```bash
npm run dev      # Mode développement avec nodemon
npm start        # Mode production
npm test         # Tests (à implémenter)
```

### Génération de la Documentation Swagger

```bash
node scripts/generate-swagger.js
```

## 📈 Statut des Services

| Service | Statut | Dernière Vérification |
|---------|--------|----------------------|
| Pronto API | 🟡 Partiel | 2025-08-06 |
| Supabase | ✅ Opérationnel | - |
| Stripe | ✅ Opérationnel | - |
| LinkedIn Sales | ✅ Opérationnel | - |

## 🚨 Problèmes Connus

### API Pronto
- ❌ Endpoints d'extraction directe de leads indisponibles
- ✅ Authentification et recherches fonctionnelles
- ✅ Création de listes opérationnelle

**Solution :** Utiliser les recherches existantes via `/api/pronto/searches`

## 📞 Support

Pour toute question ou problème :

1. Consultez la documentation spécifique dans les fichiers README
2. Vérifiez le statut des services via `/api/pronto/status`
3. Utilisez les endpoints de diagnostic disponibles

## 📝 Changelog

### 2025-08-06
- ✅ Ajout de l'API Pronto Lists
- ✅ Amélioration de la gestion d'erreurs Pronto
- ✅ Documentation complète mise à jour
- ⚠️ Marquage des endpoints Pronto indisponibles
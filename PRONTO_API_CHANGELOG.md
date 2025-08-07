# Changelog API Pronto

## [2025-08-06] - Mise à jour majeure suite aux changements de l'API Pronto

### ✅ Nouveaux Endpoints Ajoutés

#### `/api/pronto/lists` (POST)
- **Statut** : ✅ Fonctionnel
- **Description** : Création de listes d'entreprises dans Pronto
- **Paramètres** :
  - `name` (requis) : Nom de la liste
  - `webhook_url` (optionnel) : URL de webhook
  - `companies` (requis) : Tableau d'entreprises avec nom, domaine, pays, LinkedIn URL
- **Réponse** : Objet avec ID de la liste créée, détails et réponse Pronto complète
- **Documentation Swagger** : ✅ Complète avec exemples

#### `/api/pronto/searches` (GET)
- **Statut** : ✅ Fonctionnel
- **Description** : Liste des recherches Pronto disponibles
- **Réponse** : Tableau de 22 recherches avec ID, nom, nombre de leads, date de création
- **Documentation Swagger** : ✅ Mise à jour avec la structure réelle

#### `/api/pronto/status` (GET)
- **Statut** : ✅ Fonctionnel
- **Description** : Monitoring du statut de tous les services Pronto
- **Réponse** : Statut détaillé de chaque service, endpoints disponibles/indisponibles, alternatives
- **Documentation Swagger** : ✅ Nouvelle documentation complète

### ⚠️ Endpoints Modifiés (Indisponibles)

#### `/api/pronto/search-leads` (POST)
- **Statut** : ⚠️ Indisponible (503)
- **Raison** : API Pronto a supprimé l'endpoint `/extract/leads/search`
- **Réponse** : Erreur 503 avec alternatives et suggestions
- **Documentation Swagger** : ✅ Mise à jour avec statut indisponible et réponse 503

#### `/api/pronto/search-leads-from-company` (POST)
- **Statut** : ⚠️ Indisponible (503)
- **Raison** : API Pronto a supprimé l'endpoint `/extract/leads/from_company`
- **Réponse** : Erreur 503 avec alternatives
- **Documentation Swagger** : ✅ Mise à jour avec statut indisponible

#### `/api/pronto/leads/extract` (POST)
- **Statut** : ⚠️ Indisponible (503)
- **Raison** : API Pronto a supprimé l'endpoint `/leads/extract`
- **Réponse** : Erreur 503 avec détails de la requête et alternatives
- **Documentation Swagger** : ✅ Mise à jour avec statut indisponible et réponse 503

### 📚 Documentation Swagger Mise à Jour

#### Améliorations Apportées

1. **Nouveaux Endpoints** :
   - Documentation complète pour `/api/pronto/lists` avec schémas détaillés
   - Documentation mise à jour pour `/api/pronto/searches` avec structure réelle
   - Nouvelle documentation pour `/api/pronto/status` avec monitoring

2. **Endpoints Indisponibles** :
   - Titres mis à jour avec mention "(INDISPONIBLE)"
   - Descriptions modifiées pour expliquer l'indisponibilité
   - Ajout de réponses 503 avec schémas d'erreur détaillés
   - Exemples de réponses d'erreur avec alternatives

3. **Schémas de Réponse** :
   - Schémas détaillés pour les nouvelles réponses de succès
   - Schémas d'erreur 503 avec structure des alternatives
   - Exemples réalistes basés sur les vraies réponses de l'API

#### Structure des Réponses d'Erreur 503

```json
{
  "success": false,
  "error": "Service temporairement indisponible",
  "message": "L'API Pronto a modifié ses endpoints",
  "alternative": {
    "description": "Alternatives disponibles",
    "suggestions": [
      "Utilisez l'endpoint /api/pronto/searches",
      "Consultez /api/pronto/status"
    ]
  }
}
```

### 🔧 Changements Techniques

#### Configuration
- Aucun changement de configuration requis
- Les clés API Pronto existantes continuent de fonctionner
- Base URL Pronto inchangée : `https://app.prontohq.com/api/v2`

#### Gestion d'Erreurs
- Amélioration de la gestion des erreurs 404 de l'API Pronto
- Ajout de logs détaillés pour le debugging
- Réponses d'erreur plus informatives avec alternatives

#### Validation
- Validation renforcée pour l'endpoint `/api/pronto/lists`
- Vérification des paramètres requis avec messages d'erreur clairs
- Validation des structures d'entreprises dans les listes

### 🚀 Migration et Utilisation

#### Pour les Développeurs Frontend

1. **Endpoints à Migrer** :
   ```javascript
   // ❌ Ne fonctionne plus
   await fetch('/api/pronto/search-leads', { ... });
   
   // ✅ Alternative recommandée
   const searches = await fetch('/api/pronto/searches');
   ```

2. **Nouveaux Endpoints à Utiliser** :
   ```javascript
   // ✅ Création de listes d'entreprises
   await fetch('/api/pronto/lists', {
     method: 'POST',
     body: JSON.stringify({
       name: "Ma liste",
       companies: [{ name: "Pronto", domain: "prontohq.com" }]
     })
   });
   
   // ✅ Vérification du statut
   const status = await fetch('/api/pronto/status');
   ```

3. **Gestion d'Erreurs** :
   ```javascript
   try {
     const response = await fetch('/api/pronto/search-leads', { ... });
   } catch (error) {
     if (error.status === 503) {
       // Afficher les alternatives proposées
       console.log(error.alternative.suggestions);
     }
   }
   ```

### 📊 Statistiques

- **Endpoints Fonctionnels** : 3 (searches, lists, status)
- **Endpoints Indisponibles** : 3 (search-leads, search-leads-from-company, leads/extract)
- **Recherches Disponibles** : 22 recherches Pronto
- **Documentation Swagger** : 100% mise à jour

### 🔮 Prochaines Étapes

1. **Surveillance** : Monitoring continu du statut des services via `/api/pronto/status`
2. **Contact Pronto** : Demande des nouveaux endpoints d'extraction de leads
3. **Alternatives** : Développement de solutions de contournement si nécessaire
4. **Tests** : Validation continue des endpoints fonctionnels

### 📞 Support

- **Vérification du statut** : `GET /api/pronto/status`
- **Diagnostic complet** : `GET /api/pronto-workflows/diagnostic`
- **Documentation** : `http://localhost:4000/api-docs`

# API Workflow Global Pronto

## Vue d'ensemble

L'endpoint `/api/pronto/workflow/global-results` est un workflow automatique qui combine les données de toutes les recherches Pronto en un seul appel API avec filtrage avancé par nom d'entreprise.

## Endpoint

```
GET /api/pronto/workflow/global-results
```

## Fonctionnement

### Workflow Automatique

1. **Récupération des recherches** : Appel à `/api/pronto/searches` pour obtenir tous les IDs
2. **Récupération des détails** : Pour chaque ID, appel à `/api/pronto/searches/{id}` 
3. **Combinaison des résultats** : Fusion de tous les leads en un seul tableau
4. **Filtrage** : Application du filtre par nom d'entreprise (optionnel)
5. **Limitation** : Application de la limite de résultats
6. **Statistiques** : Calcul des métriques globales

### Avantages

- **Un seul appel API** au lieu de multiples appels manuels
- **Filtrage intégré** par nom d'entreprise
- **Statistiques automatiques** (nombre d'entreprises uniques, etc.)
- **Gestion d'erreurs** robuste par recherche
- **Performance optimisée** avec limitation des résultats

## Paramètres

### Comportement des Filtres

**Filtres vides** : Si aucun filtre n'est fourni ou si tous les filtres sont vides, **tous les leads** sont retournés (aucun filtrage appliqué).

**Filtres partiels** : Si certains filtres sont fournis et d'autres sont vides, seuls les filtres non vides sont appliqués.

**Nettoyage automatique** : Les espaces en début/fin sont supprimés, les valeurs vides sont ignorées.

### `company_filter` (optionnel)
- **Type** : `string`
- **Description** : Filtre par nom d'entreprise
- **Format** : Noms séparés par des virgules
- **Exemple** : `"Google,Microsoft,Apple"`
- **Comportement** :
  - Recherche insensible à la casse
  - Correspondance partielle (contient)
  - Appliqué sur `company.name`

### `title_filter` (optionnel)
- **Type** : `string`
- **Description** : Filtre par titre/poste du lead
- **Format** : Titres séparés par des virgules
- **Exemple** : `"CEO,CTO,Manager"`
- **Comportement** :
  - Recherche insensible à la casse
  - Correspondance partielle (contient)
  - Appliqué sur `lead.title`

### `lead_location_filter` (optionnel)
- **Type** : `string`
- **Description** : Filtre par localisation du lead
- **Format** : Localisations séparées par des virgules
- **Exemple** : `"Paris,London,New York"`
- **Comportement** :
  - Recherche insensible à la casse
  - Correspondance partielle (contient)
  - Appliqué sur `lead.location` ou `lead.current_location`

### `employee_range_filter` (optionnel)
- **Type** : `string`
- **Description** : Filtre par taille d'entreprise
- **Format** : Tailles séparées par des virgules
- **Exemple** : `"1-10,11-50,51-200"`
- **Comportement** :
  - Recherche insensible à la casse
  - Correspondance partielle (contient)
  - Appliqué sur `company.employee_range`

### `company_location_filter` (optionnel)
- **Type** : `string`
- **Description** : Filtre par localisation de l'entreprise
- **Format** : Localisations séparées par des virgules
- **Exemple** : `"Paris,London,Berlin"`
- **Comportement** :
  - Recherche insensible à la casse
  - Correspondance partielle (contient)
  - Appliqué sur `company.location` ou `company.headquarters`

### `industry_filter` (optionnel)
- **Type** : `string`
- **Description** : Filtre par secteur d'activité
- **Format** : Secteurs séparés par des virgules
- **Exemple** : `"Technology,Finance,Healthcare"`
- **Comportement** :
  - Recherche insensible à la casse
  - Correspondance partielle (contient)
  - Appliqué sur `company.industry`

### `limit` (optionnel)
- **Type** : `integer`
- **Défaut** : `1000`
- **Min/Max** : `1` à `10000`
- **Description** : Nombre maximum de leads à retourner

### `include_search_details` (optionnel)
- **Type** : `boolean`
- **Défaut** : `false`
- **Description** : Inclure les détails des recherches dans la réponse

## Structure de Réponse

```json
{
  "success": true,
  "total_searches": 5,
  "total_leads": 1250,
  "filtered_leads": 45,
  "unique_companies": 12,
  "applied_filters": {
    "company_names": ["google", "microsoft"]
  },
  "leads": [
    {
      "search_id": "search-123",
      "search_name": "Tech CEOs Paris",
      "lead": {
        "first_name": "Jean",
        "last_name": "Dupont",
        "full_name": "Jean Dupont",
        "gender": "male",
        "most_probable_email": "jean@google.com",
        "phones": ["+33123456789"],
        "title": "CEO",
        "title_description": "Chief Executive Officer",
        "summary": "Experienced CEO",
        "linkedin_profile_url": "https://linkedin.com/in/jeandupont",
        "profile_image_url": "https://example.com/profile.jpg",
        "is_premium_linkedin": true,
        "connection_degree": 2,
        "status": "QUALIFIED",
        "rejection_reason": [],
        "lk_headline": "CEO at Google",
        "sales_navigator_profile_url": "https://linkedin.com/sales/lead/123",
        "current_positions_count": 1,
        "years_in_position": 3,
        "months_in_position": 6,
        "years_in_company": 5,
        "months_in_company": 2,
        "lk_connections_count": 500,
        "is_open_profile_linkedin": false,
        "is_open_to_work_linkedin": false,
        "most_probable_email_status": "verified"
      },
      "company": {
        "name": "Google France",
        "cleaned_name": "google france",
        "website": "https://google.com",
        "location": "Paris, France",
        "industry": "Technology",
        "headquarters": "Paris, France",
        "description": "Leading tech company",
        "linkedin_url": "https://linkedin.com/company/google",
        "employee_range": "1000+",
        "company_profile_picture": "https://example.com/logo.jpg"
      }
    }
  ],
  "searches": [
    {
      "id": "search-123",
      "name": "Tech CEOs Paris",
      "created_at": "2023-11-07T05:31:56Z",
      "leads_count": 25,
      "status": "completed"
    }
  ],
  "errors": [
    {
      "search_id": "search-456",
      "search_name": "Failed Search",
      "error": "API timeout"
    }
  ],
  "processing_time": 12.5,
  "message": "45 leads trouvés après filtrage sur 1250 leads totaux"
}
```

## Exemples d'Utilisation

### 1. Récupérer tous les leads (aucun filtre)

```bash
curl -X GET "http://localhost:4000/api/pronto/workflow/global-results?limit=100"
```

### 2. Filtres vides explicites (même résultat que ci-dessus)

```bash
curl -X GET "http://localhost:4000/api/pronto/workflow/global-results?company_filter=&title_filter=&limit=100"
```

### 2. Filtrer par entreprises spécifiques

```bash
curl -X GET "http://localhost:4000/api/pronto/workflow/global-results?company_filter=Google,Microsoft,Apple&limit=50"
```

### 3. Filtrer par titres/postes

```bash
curl -X GET "http://localhost:4000/api/pronto/workflow/global-results?title_filter=CEO,CTO,VP&limit=30"
```

### 4. Filtrage par localisation

```bash
curl -X GET "http://localhost:4000/api/pronto/workflow/global-results?lead_location_filter=Paris,London&company_location_filter=France,UK&limit=40"
```

### 5. Filtrage par secteur et taille d'entreprise

```bash
curl -X GET "http://localhost:4000/api/pronto/workflow/global-results?industry_filter=Technology,Finance&employee_range_filter=51-200,201-500&limit=60"
```

### 6. Filtrage combiné (tous les filtres)

```bash
curl -X GET "http://localhost:4000/api/pronto/workflow/global-results?company_filter=Google&title_filter=CEO&lead_location_filter=Paris&employee_range_filter=1000&company_location_filter=France&industry_filter=Technology&limit=10"
```

### 7. Avec détails des recherches

```bash
curl -X GET "http://localhost:4000/api/pronto/workflow/global-results?include_search_details=true&limit=200"
```

### 8. Filtrage complexe par mots-clés

```bash
curl -X GET "http://localhost:4000/api/pronto/workflow/global-results?company_filter=tech,software,digital&industry_filter=Technology,Software&limit=500"
```

## Gestion d'Erreurs

### Erreurs par Recherche
- Les erreurs individuelles n'interrompent pas le workflow
- Chaque erreur est reportée dans le tableau `errors`
- Le traitement continue pour les autres recherches

### Codes de Réponse
- **200** : Succès (même avec des erreurs partielles)
- **400** : Paramètres invalides
- **401** : Clé API Pronto invalide
- **500** : Erreur serveur critique

### Exemple d'Erreur Partielle
```json
{
  "success": true,
  "total_searches": 5,
  "total_leads": 800,
  "filtered_leads": 800,
  "leads": [...],
  "errors": [
    {
      "search_id": "search-failed",
      "search_name": "Broken Search",
      "error": "Request timeout"
    }
  ],
  "processing_time": 15.2,
  "message": "800 leads trouvés avec 1 erreur de recherche"
}
```

## Performance

### Optimisations
- **Traitement séquentiel** pour éviter la surcharge de l'API Pronto
- **Limitation automatique** des résultats par recherche (1000 max)
- **Gestion de timeout** pour éviter les blocages
- **Logs détaillés** pour le monitoring

### Métriques Typiques
- **Temps de traitement** : 10-30 secondes selon le nombre de recherches
- **Débit** : ~100-200 leads/seconde
- **Mémoire** : Optimisée pour de gros volumes

### Recommandations
- Utilisez `limit` pour limiter les résultats si vous n'avez pas besoin de tout
- Le filtrage côté serveur est plus efficace que côté client
- Surveillez `processing_time` pour détecter les ralentissements

## Cas d'Usage

### 1. Dashboard Global
Afficher un aperçu de tous les leads disponibles :
```javascript
const response = await fetch('/api/pronto/workflow/global-results?limit=100');
const data = await response.json();
console.log(`${data.total_leads} leads disponibles dans ${data.total_searches} recherches`);
```

### 2. Recherche d'Entreprises Spécifiques
Trouver tous les contacts dans certaines entreprises :
```javascript
const companies = ['Google', 'Microsoft', 'Apple'];
const response = await fetch(`/api/pronto/workflow/global-results?company_filter=${companies.join(',')}`);
```

### 3. Export de Données
Récupérer toutes les données pour export :
```javascript
const response = await fetch('/api/pronto/workflow/global-results?limit=10000&include_search_details=true');
```

### 4. Analyse de Données
Obtenir des statistiques globales :
```javascript
const response = await fetch('/api/pronto/workflow/global-results?limit=1');
const stats = {
  totalSearches: response.total_searches,
  totalLeads: response.total_leads,
  uniqueCompanies: response.unique_companies
};
```

## Monitoring et Debug

### Logs Serveur
```
🔄 Démarrage du workflow global Pronto
📊 Paramètres: company_filter="Google,Microsoft", limit=100
📋 Étape 1: Récupération de toutes les recherches...
✅ 5 recherche(s) trouvée(s)
🔍 Étape 2: Récupération des détails de chaque recherche...
📊 Traitement recherche 1/5: search-123 - Tech CEOs Paris
✅ Recherche search-123: 25 leads ajoutés
📊 Total des leads récupérés: 125
🔍 Étape 3: Application du filtre par nom d'entreprise...
✅ Filtrage terminé: 15 leads correspondent aux critères
✅ Workflow terminé avec succès
```

### Métriques Importantes
- `processing_time` : Temps total de traitement
- `total_searches` : Nombre de recherches traitées
- `errors.length` : Nombre d'erreurs rencontrées
- Ratio `filtered_leads/total_leads` : Efficacité du filtrage

## Sécurité

- **Clé API** : Gérée côté serveur, non exposée au client
- **Limitation de débit** : Respecte les limites de l'API Pronto
- **Validation des paramètres** : Tous les paramètres sont validés
- **Gestion d'erreurs** : Pas d'exposition d'informations sensibles

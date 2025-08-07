# Documentation API Pronto

## Vue d'ensemble

L'API Pronto permet d'interagir avec les services de prospection et de gestion de leads de Pronto. Cette documentation couvre les endpoints disponibles, leurs statuts actuels, et les alternatives en cas d'indisponibilité.

## Statut des Services

### ✅ Services Disponibles

| Service | Endpoint | Méthode | Description |
|---------|----------|---------|-------------|
| **Authentification** | - | - | Connexion à l'API Pronto fonctionnelle |
| **Recherches** | `/api/pronto/searches` | GET | Liste des recherches existantes |
| **Création de listes** | `/api/pronto/lists` | POST | Création de listes d'entreprises |
| **Statut** | `/api/pronto/status` | GET | Vérification du statut des services |

### ❌ Services Indisponibles

| Service | Endpoint | Statut | Raison |
|---------|----------|--------|--------|
| **Recherche de leads** | `/api/pronto/search-leads` | 503 | API Pronto modifiée |
| **Leads par entreprise** | `/api/pronto/search-leads-from-company` | 503 | API Pronto modifiée |
| **Extraction de leads** | `/api/pronto/leads/extract` | 503 | API Pronto modifiée |

## Endpoints Disponibles

### 1. Liste des Recherches

```http
GET /api/pronto/searches
```

**Description :** Récupère la liste de toutes les recherches Pronto disponibles.

**Réponse :**
```json
{
  "success": true,
  "searches": [
    {
      "id": "39775257-9a6f-433a-ac2c-2cd3a39605a0",
      "name": "[Atlas Digital] Resp. Marketing - 1 / 50",
      "leads_count": 12,
      "created_at": "2025-08-06T14:59:33.284Z",
      "access_url": "/api/pronto-workflows/search-leads/39775257-9a6f-433a-ac2c-2cd3a39605a0"
    }
  ],
  "total": 22,
  "message": "22 recherches disponibles"
}
```

### 2. Création de Listes d'Entreprises

```http
POST /api/pronto/lists
```

**Description :** Crée une nouvelle liste d'entreprises dans Pronto.

**Corps de la requête :**
```json
{
  "name": "Ma liste d'entreprises",
  "webhook_url": "https://webhook.example.com",
  "companies": [
    {
      "name": "Pronto",
      "country_code": "FR",
      "domain": "prontohq.com",
      "linkedin_url": "https://www.linkedin.com/company/prontohq"
    },
    {
      "name": "Google",
      "country_code": "US",
      "domain": "google.com",
      "linkedin_url": "https://www.linkedin.com/company/google"
    }
  ]
}
```

**Paramètres :**
- `name` (requis) : Nom de la liste
- `webhook_url` (optionnel) : URL de webhook pour les notifications
- `companies` (requis) : Tableau d'entreprises à ajouter

**Paramètres des entreprises :**
- `name` (requis) : Nom de l'entreprise
- `country_code` (optionnel) : Code pays (ex: FR, US)
- `domain` (optionnel) : Domaine de l'entreprise
- `linkedin_url` (optionnel) : URL LinkedIn de l'entreprise

**Réponse :**
```json
{
  "success": true,
  "list": {
    "id": "df62412c-55a6-4fe2-af91-0b74b9e0f454",
    "name": "Ma liste d'entreprises",
    "webhook_url": "https://webhook.example.com",
    "companies_count": 2,
    "companies": [...],
    "created_at": "2025-08-06T21:06:07.918Z",
    "pronto_response": {
      "id": "df62412c-55a6-4fe2-af91-0b74b9e0f454",
      "linkedin_id": "7358966630862757888",
      "type": "companies"
    }
  },
  "message": "Liste \"Ma liste d'entreprises\" créée avec succès avec 2 entreprise(s)"
}
```

### 3. Statut des Services

```http
GET /api/pronto/status
```

**Description :** Vérifie le statut de tous les services Pronto.

**Réponse :**
```json
{
  "success": true,
  "status": {
    "timestamp": "2025-08-06T21:08:13.856Z",
    "services": {
      "authentication": {
        "available": true,
        "message": "Authentification réussie"
      },
      "searches": {
        "available": true,
        "message": "Endpoint /searches disponible"
      },
      "lists_creation": {
        "available": true,
        "message": "Endpoint /lists disponible"
      },
      "leads_extraction": {
        "available": false,
        "message": "Endpoints d'extraction directe indisponibles"
      }
    },
    "available_endpoints": [
      "GET /api/pronto/searches",
      "POST /api/pronto/lists"
    ],
    "unavailable_endpoints": [
      "POST /api/pronto/search-leads",
      "POST /api/pronto/search-leads-from-company",
      "POST /api/pronto/leads/extract"
    ]
  }
}
```

## Endpoints Indisponibles

### Recherche de Leads (Indisponible)

```http
POST /api/pronto/search-leads
```

**Statut :** 503 Service Unavailable

**Raison :** L'API Pronto a modifié ses endpoints d'extraction de leads.

**Alternative :** Utilisez `/api/pronto/searches` pour voir les recherches existantes.

### Extraction de Leads (Indisponible)

```http
POST /api/pronto/leads/extract
```

**Statut :** 503 Service Unavailable

**Raison :** L'endpoint `/leads/extract` de l'API Pronto n'est plus disponible.

## Gestion d'Erreurs

### Codes de Statut

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Paramètres invalides |
| 401 | Clé API invalide |
| 429 | Limite de taux dépassée |
| 503 | Service temporairement indisponible |
| 500 | Erreur serveur |

### Format des Erreurs

```json
{
  "success": false,
  "error": "Description de l'erreur",
  "message": "Message détaillé",
  "details": "Informations supplémentaires"
}
```

## Configuration

### Variables d'Environnement

```env
PRONTO_API_KEY=votre_cle_api_pronto
```

### URL de Base

```
Base URL: https://app.prontohq.com/api/v2
```

## Exemples d'Utilisation

### Curl - Création d'une Liste

```bash
curl --request POST \
  --url http://localhost:4000/api/pronto/lists \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Ma liste test",
    "companies": [
      {
        "name": "Pronto",
        "country_code": "FR",
        "domain": "prontohq.com"
      }
    ]
  }'
```

### JavaScript - Récupération des Recherches

```javascript
const response = await fetch('/api/pronto/searches');
const data = await response.json();
console.log(`${data.total} recherches disponibles`);
```

## Support et Contact

Pour toute question concernant l'API Pronto ou pour signaler des problèmes :

1. Consultez `/api/pronto/status` pour vérifier l'état des services
2. Utilisez `/api/pronto-workflows/diagnostic` pour un diagnostic complet
3. Contactez l'équipe Pronto pour les nouveaux endpoints d'API

## Changelog

### 2025-08-06
- ✅ Ajout de l'endpoint `/api/pronto/lists` pour la création de listes
- ✅ Ajout de l'endpoint `/api/pronto/status` pour le monitoring
- ⚠️ Endpoints d'extraction de leads marqués comme indisponibles
- 📝 Documentation complète mise à jour

# 🔄 API d'Enrichment - Prosperian Backend

Ce document décrit les APIs de gestion des enrichments et leads enrichis pour le backend Prosperian.

## 📋 Vue d'ensemble

Le système d'enrichment permet de :
1. **Créer des campagnes d'enrichment** pour organiser les leads
2. **Ajouter des leads** à ces campagnes
3. **Suivre le statut** des enrichments
4. **Gérer les données enrichies** des leads

## 🗄️ Structure de la Base de Données

### Table `enrichments`
```sql
CREATE TABLE public.enrichments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text DEFAULT 'En cours',
  type text NOT NULL,
  date_created timestamp with time zone DEFAULT now(),
  description text,
  created_by uuid REFERENCES public.utilisateur(id) ON DELETE SET NULL
);
```

### Table `lead_enrich`
```sql
CREATE TABLE public.lead_enrich (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrichment_id uuid NOT NULL REFERENCES public.enrichments(id) ON DELETE CASCADE,
  firstname text NOT NULL,
  lastname text NOT NULL,
  company_name text,
  domain text,
  linkedin_url text,
  date_creation timestamp with time zone DEFAULT now()
);
```

## 🚀 APIs Disponibles

### Base URL
```
http://localhost:4000/api/enrichment
```

## 📝 Gestion des Enrichments

### 1. Créer un Enrichment

**Endpoint :** `POST /api/enrichment`

**Description :** Créer une nouvelle campagne d'enrichment

**Body :**
```json
{
  "name": "Campagne LinkedIn 2024",
  "type": "linkedin_enrichment",
  "description": "Enrichment des profils LinkedIn pour la prospection"
}
```

**Réponse de succès (201) :**
```json
{
  "success": true,
  "message": "Enrichment créé avec succès",
  "enrichment": {
    "id": "uuid",
    "name": "Campagne LinkedIn 2024",
    "status": "En cours",
    "type": "linkedin_enrichment",
    "date_created": "2024-01-01T00:00:00.000Z",
    "description": "Enrichment des profils LinkedIn pour la prospection",
    "created_by": "user-uuid"
  }
}
```

### 2. Lister les Enrichments

**Endpoint :** `GET /api/enrichment`

**Paramètres de requête :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 10)
- `status` (optionnel) : Filtrer par statut

**Réponse de succès (200) :**
```json
{
  "success": true,
  "enrichments": [
    {
      "id": "uuid",
      "name": "Campagne LinkedIn 2024",
      "status": "En cours",
      "type": "linkedin_enrichment",
      "date_created": "2024-01-01T00:00:00.000Z",
      "description": "Enrichment des profils LinkedIn",
      "created_by": "user-uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 3. Récupérer un Enrichment

**Endpoint :** `GET /api/enrichment/{id}`

**Réponse de succès (200) :**
```json
{
  "success": true,
  "enrichment": {
    "id": "uuid",
    "name": "Campagne LinkedIn 2024",
    "status": "En cours",
    "type": "linkedin_enrichment",
    "date_created": "2024-01-01T00:00:00.000Z",
    "description": "Enrichment des profils LinkedIn",
    "created_by": "user-uuid"
  }
}
```

### 4. Mettre à jour un Enrichment

**Endpoint :** `PUT /api/enrichment/{id}`

**Body :**
```json
{
  "name": "Campagne LinkedIn 2024 - Mise à jour",
  "status": "Terminé",
  "description": "Enrichment terminé avec succès"
}
```

### 5. Supprimer un Enrichment

**Endpoint :** `DELETE /api/enrichment/{id}`

**Réponse de succès (200) :**
```json
{
  "success": true,
  "message": "Enrichment supprimé avec succès"
}
```

## 👥 Gestion des Leads Enrichis

### 1. Ajouter un Lead Enrichi

**Endpoint :** `POST /api/enrichment/{enrichmentId}/leads`

**Description :** Ajouter un lead à une campagne d'enrichment

**Body :**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "company_name": "TechCorp",
  "domain": "techcorp.com",
  "linkedin_url": "https://linkedin.com/in/johndoe"
}
```

**Réponse de succès (201) :**
```json
{
  "success": true,
  "message": "Lead enrichi créé avec succès",
  "leadEnrich": {
    "id": "uuid",
    "enrichment_id": "enrichment-uuid",
    "firstname": "John",
    "lastname": "Doe",
    "company_name": "TechCorp",
    "domain": "techcorp.com",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "date_creation": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Lister les Leads d'un Enrichment

**Endpoint :** `GET /api/enrichment/{enrichmentId}/leads`

**Paramètres de requête :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 10)

**Réponse de succès (200) :**
```json
{
  "success": true,
  "leads": [
    {
      "id": "uuid",
      "enrichment_id": "enrichment-uuid",
      "firstname": "John",
      "lastname": "Doe",
      "company_name": "TechCorp",
      "domain": "techcorp.com",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "date_creation": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 3. Ajouter des Leads en Lot

**Endpoint :** `POST /api/enrichment/{enrichmentId}/leads/bulk`

**Description :** Ajouter plusieurs leads en une seule requête

**Body :**
```json
{
  "leads": [
    {
      "firstname": "John",
      "lastname": "Doe",
      "company_name": "TechCorp",
      "domain": "techcorp.com",
      "linkedin_url": "https://linkedin.com/in/johndoe"
    },
    {
      "firstname": "Jane",
      "lastname": "Smith",
      "company_name": "DataCorp",
      "domain": "datacorp.com",
      "linkedin_url": "https://linkedin.com/in/janesmith"
    }
  ]
}
```

**Réponse de succès (201) :**
```json
{
  "success": true,
  "message": "2 leads enrichis créés avec succès",
  "leads": [
    {
      "id": "uuid-1",
      "enrichment_id": "enrichment-uuid",
      "firstname": "John",
      "lastname": "Doe",
      "company_name": "TechCorp",
      "domain": "techcorp.com",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "date_creation": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "enrichment_id": "enrichment-uuid",
      "firstname": "Jane",
      "lastname": "Smith",
      "company_name": "DataCorp",
      "domain": "datacorp.com",
      "linkedin_url": "https://linkedin.com/in/janesmith",
      "date_creation": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🔐 Authentification

Toutes les APIs d'enrichment nécessitent une authentification JWT :

```bash
Authorization: Bearer <your-jwt-token>
```

## 📊 Statuts des Enrichments

- **En cours** : L'enrichment est en cours de traitement
- **Terminé** : L'enrichment est terminé avec succès
- **Échec** : L'enrichment a échoué

## 🎯 Workflow Typique

1. **Créer un enrichment** avec `POST /api/enrichment`
2. **Ajouter des leads** avec `POST /api/enrichment/{id}/leads`
3. **Suivre le statut** avec `GET /api/enrichment/{id}`
4. **Consulter les leads** avec `GET /api/enrichment/{id}/leads`
5. **Mettre à jour le statut** avec `PUT /api/enrichment/{id}`

## 🔗 Intégration avec Swagger

La documentation complète est disponible dans Swagger UI :
```
http://localhost:4000/api-docs
```

Sections disponibles :
- **Enrichment** : Gestion des campagnes d'enrichment
- **LeadEnrich** : Gestion des leads enrichis

## 🚨 Gestion des Erreurs

### Erreurs communes

**400 - Données invalides :**
```json
{
  "success": false,
  "error": "Données manquantes",
  "message": "Le nom et le type sont requis"
}
```

**401 - Non authentifié :**
```json
{
  "success": false,
  "error": "Token manquant",
  "message": "Token d'authentification requis"
}
```

**404 - Non trouvé :**
```json
{
  "success": false,
  "error": "Non trouvé",
  "message": "Enrichment introuvable"
}
```

**500 - Erreur serveur :**
```json
{
  "success": false,
  "error": "Erreur serveur",
  "message": "Erreur lors de la création de l'enrichment"
}
```

## 📈 Exemples d'Utilisation

### Exemple 1 : Créer une campagne d'enrichment LinkedIn

```bash
curl -X POST http://localhost:4000/api/enrichment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Prospection LinkedIn Q1 2024",
    "type": "linkedin_enrichment",
    "description": "Enrichment des profils LinkedIn pour la prospection Q1"
  }'
```

### Exemple 2 : Ajouter des leads en lot

```bash
curl -X POST http://localhost:4000/api/enrichment/<enrichment-id>/leads/bulk \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [
      {
        "firstname": "Alice",
        "lastname": "Johnson",
        "company_name": "InnovationCorp",
        "domain": "innovationcorp.com"
      },
      {
        "firstname": "Bob",
        "lastname": "Wilson",
        "company_name": "StartupXYZ",
        "domain": "startupxyz.com"
      }
    ]
  }'
```

### Exemple 3 : Suivre le statut d'un enrichment

```bash
curl -X GET http://localhost:4000/api/enrichment/<enrichment-id> \
  -H "Authorization: Bearer <token>"
```

## 🔄 Intégration Future

Ce système d'enrichment peut être étendu pour :
- **Intégration avec Pronto** pour l'enrichment automatique
- **Synchronisation avec Google Places** pour les données d'entreprise
- **Export vers CRM** (Salesforce, HubSpot, etc.)
- **Analytics et reporting** sur les campagnes d'enrichment 
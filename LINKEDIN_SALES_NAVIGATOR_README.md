# LinkedIn Sales Navigator API

Cette API permet de générer et parser des URLs de recherche LinkedIn Sales Navigator avec filtres avancés.

## Endpoints disponibles

### 1. Générer une URL de recherche
**POST** `/api/linkedin-sales/generate-url`

Génère une URL de recherche LinkedIn Sales Navigator avec filtres avancés.

#### Exemple de requête pour les prospects (people)
```json
{
  "searchType": "people",
  "keywords": "développeur",
  "filters": [
    {
      "type": "CURRENT_COMPANY",
      "values": [
        {
          "id": "urn:li:organization:825160",
          "text": "Hyundai Motor Company",
          "selectionType": "INCLUDED"
        }
      ]
    },
    {
      "type": "FUNCTION",
      "values": [
        {
          "id": "software_engineer",
          "text": "Software Engineer",
          "selectionType": "INCLUDED"
        }
      ]
    },
    {
      "type": "REGION",
      "values": [
        {
          "id": "fr:75",
          "text": "Île-de-France",
          "selectionType": "INCLUDED"
        }
      ]
    }
  ]
}
```

#### Exemple de requête pour les entreprises (company)
```json
{
  "searchType": "company",
  "keywords": "tech",
  "filters": [
    {
      "type": "COMPANY_HEADCOUNT",
      "values": [
        {
          "id": "B",
          "text": "1-10",
          "selectionType": "INCLUDED"
        }
      ]
    },
    {
      "type": "INDUSTRY",
      "values": [
        {
          "id": "4",
          "text": "Technology",
          "selectionType": "INCLUDED"
        }
      ]
    }
  ]
}
```

### 2. Parser une URL existante
**POST** `/api/linkedin-sales/parse-url`

Parse une URL de recherche LinkedIn Sales Navigator pour extraire les paramètres et filtres.

#### Exemple de requête
```json
{
  "url": "https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:\"Hyundai Motor Company\",selectionType:INCLUDED)))))&keywords=développeur"
}
```

### 3. Obtenir les types de filtres disponibles
**GET** `/api/linkedin-sales/filter-types`

Retourne la liste des types de filtres disponibles pour LinkedIn Sales Navigator.

### 4. Valider des filtres
**POST** `/api/linkedin-sales/validate-filters`

Valide la structure et la cohérence des filtres pour LinkedIn Sales Navigator.

#### Exemple de requête
```json
{
  "searchType": "people",
  "filters": [
    {
      "type": "CURRENT_COMPANY",
      "values": [
        {
          "id": "urn:li:organization:825160",
          "text": "Hyundai Motor Company",
          "selectionType": "INCLUDED"
        }
      ]
    }
  ]
}
```

## Types de filtres disponibles

### Pour les prospects (people)
- `CURRENT_COMPANY` - Entreprise actuelle
- `PAST_COMPANY` - Ancienne entreprise
- `COMPANY_HEADCOUNT` - Taille de l'entreprise
- `FUNCTION` - Fonction/role
- `CURRENT_TITLE` - Titre actuel
- `SENIORITY_LEVEL` - Niveau de séniorité
- `REGION` - Région géographique
- `POSTAL_CODE` - Code postal
- `INDUSTRY` - Secteur d'activité

### Pour les entreprises (company)
- `ANNUAL_REVENUE` - Chiffre d'affaires annuel
- `COMPANY_HEADCOUNT` - Taille de l'entreprise
- `COMPANY_HEADCOUNT_GROWTH` - Croissance de l'entreprise
- `INDUSTRY` - Secteur d'activité
- `REGION` - Région géographique
- `POSTAL_CODE` - Code postal

## Structure des URLs générées

### URL de base
- **Prospects**: `https://www.linkedin.com/sales/search/people`
- **Entreprises**: `https://www.linkedin.com/sales/search/company`

### Paramètres
- `query` - Paramètre encodé contenant les filtres et mots-clés
- `sessionId` - ID de session LinkedIn (optionnel)
- `viewAllFilters` - Afficher tous les filtres (optionnel)

### Exemple d'URL générée
```
https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:"Hyundai Motor Company",selectionType:INCLUDED)))))&keywords=développeur
```

## Utilisation

### 1. Générer une URL simple
```javascript
const response = await fetch('/api/linkedin-sales/generate-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    searchType: 'people',
    keywords: 'développeur'
  })
});

const result = await response.json();
console.log(result.url); // URL générée
```

### 2. Générer une URL avec filtres avancés
```javascript
const response = await fetch('/api/linkedin-sales/generate-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    searchType: 'company',
    keywords: 'tech',
    filters: [
      {
        type: 'COMPANY_HEADCOUNT',
        values: [
          {
            id: 'B',
            text: '1-10',
            selectionType: 'INCLUDED'
          }
        ]
      }
    ]
  })
});
```

### 3. Parser une URL existante
```javascript
const response = await fetch('/api/linkedin-sales/parse-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://www.linkedin.com/sales/search/people?query=...'
  })
});

const result = await response.json();
console.log(result.filters); // Filtres extraits
```

## Codes de réponse

- `200` - Succès
- `400` - Requête invalide (type de recherche incorrect, filtres invalides, etc.)
- `500` - Erreur serveur

## Notes importantes

1. **IDs des filtres** : Les IDs des filtres (comme les URNs LinkedIn pour les entreprises) doivent être obtenus via les suggestions de filtres de Sales Navigator.

2. **Encodage** : Les paramètres sont automatiquement encodés dans l'URL générée.

3. **Validation** : Utilisez l'endpoint de validation pour vérifier la cohérence de vos filtres avant de générer l'URL.

4. **Session** : L'ID de session est optionnel mais peut être utile pour maintenir la cohérence des recherches.

## Documentation Swagger

La documentation complète de l'API est disponible via Swagger UI à l'adresse :
`http://localhost:4000/api-docs`

## Exemples d'utilisation avancée

### Recherche de prospects avec plusieurs filtres
```json
{
  "searchType": "people",
  "keywords": "développeur fullstack",
  "filters": [
    {
      "type": "CURRENT_COMPANY",
      "values": [
        {
          "id": "urn:li:organization:825160",
          "text": "Hyundai Motor Company",
          "selectionType": "INCLUDED"
        }
      ]
    },
    {
      "type": "FUNCTION",
      "values": [
        {
          "id": "software_engineer",
          "text": "Software Engineer",
          "selectionType": "INCLUDED"
        },
        {
          "id": "full_stack_developer",
          "text": "Full Stack Developer",
          "selectionType": "INCLUDED"
        }
      ]
    },
    {
      "type": "REGION",
      "values": [
        {
          "id": "fr:75",
          "text": "Île-de-France",
          "selectionType": "INCLUDED"
        }
      ]
    },
    {
      "type": "SENIORITY_LEVEL",
      "values": [
        {
          "id": "senior",
          "text": "Senior",
          "selectionType": "INCLUDED"
        }
      ]
    }
  ]
}
```

### Recherche d'entreprises avec critères financiers
```json
{
  "searchType": "company",
  "keywords": "startup",
  "filters": [
    {
      "type": "COMPANY_HEADCOUNT",
      "values": [
        {
          "id": "A",
          "text": "1-10",
          "selectionType": "INCLUDED"
        },
        {
          "id": "B",
          "text": "11-50",
          "selectionType": "INCLUDED"
        }
      ]
    },
    {
      "type": "ANNUAL_REVENUE",
      "values": [
        {
          "id": "1",
          "text": "Moins de 1M",
          "selectionType": "INCLUDED"
        }
      ]
    },
    {
      "type": "INDUSTRY",
      "values": [
        {
          "id": "4",
          "text": "Technology",
          "selectionType": "INCLUDED"
        }
      ]
    }
  ]
}
``` 
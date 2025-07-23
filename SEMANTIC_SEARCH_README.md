# 🧠 Intégration Recherche Sémantique - Documentation

## 📋 Vue d'ensemble

L'intégration de la recherche sémantique permet aux utilisateurs de rechercher des entreprises en utilisant des termes naturels au lieu de codes NAF techniques. Par exemple, au lieu de chercher "Code NAF 9602A", ils peuvent chercher "coiffeur" ou "services de beauté".

## 🚀 Fonctionnalités

✅ **Onglet "Sémantique"** dans les filtres d'activités  
✅ **Mapping intelligent** : Convertit les termes naturels en codes NAF  
✅ **Synonymes** : Reconnaît "resto", "doc", "auto", etc.  
✅ **Concepts populaires** : Boutons rapides pour les termes fréquents  
✅ **Auto-complétion** : Suggestions en temps réel  
✅ **Recherche multi-termes** : Combine plusieurs concepts  
✅ **Analyse d'intention** : Évalue la confiance de la recherche  

## 🧩 Architecture

### Backend (Node.js)
- **Service sémantique** : `/src/config/semantic.js`
- **Routes API** : `/src/routes/semantic-search.js`
- **Mapping NAF** : 100+ concepts → codes NAF

### Frontend (React/TypeScript)
- **Service frontend** : `/src/services/semanticService.ts`
- **Interface utilisateur** : Intégré dans `FiltersPanel.tsx`
- **Logique de recherche** : `pages/Recherche/Entreprises/index.tsx`

## 🔧 API Endpoints

### 1. Analyser un terme
```
GET /api/semantic/analyze?term=services de beauté
```
**Réponse :**
```json
{
  "success": true,
  "analysis": {
    "originalTerm": "services de beauté",
    "nafCodes": ["9602A", "9602B"],
    "codesCount": 2,
    "confidence": "high",
    "relatedConcepts": ["beauté", "coiffure", "esthétique"]
  }
}
```

### 2. Suggestions auto-complétion
```
GET /api/semantic/suggestions?term=rest
```
**Réponse :**
```json
{
  "success": true,
  "suggestions": [
    {
      "term": "restauration",
      "nafCodes": ["5610A", "5610C", "5621Z"],
      "type": "concept"
    },
    {
      "term": "resto",
      "originalTerm": "restaurant",
      "nafCodes": ["5610A"],
      "type": "synonym"
    }
  ]
}
```

### 3. Concepts populaires
```
GET /api/semantic/popular
```

### 4. Recherche d'entreprises
```
POST /api/semantic/search
{
  "term": "services de beauté",
  "location": "Paris",
  "limit": 50
}
```

## 🎯 Mapping Sémantique

### Catégories principales :

| **Concept** | **Codes NAF** | **Description** |
|-------------|---------------|-----------------|
| `restauration` | 5610A, 5610C, 5621Z | Restaurants, cafés, bars |
| `services de beauté` | 9602A, 9602B | Coiffeurs, esthéticiennes |
| `santé` | 8610Z, 8621Z, 8622A | Médecins, dentistes |
| `automobile` | 4511Z, 4520A, 4520B | Garages, vente auto |
| `bâtiment` | 4120A, 4312A, 4321A | Construction, plomberie |
| `informatique` | 6201Z, 6202A, 6202B | Développement, IT |

### Synonymes reconnus :
- `resto` → `restaurant`
- `doc` → `médecin`
- `auto` → `automobile`
- `info` → `informatique`
- `btp` → `bâtiment`

## 🧪 Comment tester

### 1. **Via l'interface utilisateur** :
1. Ouvrez http://localhost:5174
2. Allez sur "Recherche" → "Entreprises"
3. Dans les filtres, cliquez sur l'onglet **"Sémantique"**
4. Testez avec :
   - **Concepts populaires** : Cliquez sur "restauration", "services de beauté"
   - **Recherche libre** : Tapez "coiffeur", "garage", "médecin"
   - **Synonymes** : Essayez "resto", "doc", "auto"

### 2. **Via l'API** :
```bash
# Tester l'analyse
curl "http://localhost:4000/api/semantic/analyze?term=coiffeur"

# Tester les suggestions
curl "http://localhost:4000/api/semantic/suggestions?term=rest"

# Tester les concepts populaires
curl "http://localhost:4000/api/semantic/popular"
```

### 3. **Exemples de recherche** :
- **"services de beauté"** → Trouve coiffeurs, esthéticiennes, spas
- **"restauration"** → Trouve restaurants, cafés, bars
- **"garage"** → Trouve garages, réparation auto
- **"docteur"** → Trouve médecins, centres médicaux

## ⚡ Avantages de la recherche sémantique

### 🎯 **Pour les utilisateurs** :
- **Plus intuitive** : Terme naturel vs code technique
- **Plus rapide** : Pas besoin de connaître les codes NAF
- **Plus flexible** : Synonymes et variations acceptés
- **Plus précise** : Concepts larges → codes spécifiques

### 💼 **Pour l'entreprise** :
- **Meilleure UX** : Interface plus accessible
- **Plus d'utilisation** : Barrier d'entrée réduite
- **Découvrabilité** : Les utilisateurs trouvent plus facilement
- **Satisfaction client** : Recherche plus naturelle

## 🔍 Exemples concrets

### Avant (avec codes NAF) :
❌ Utilisateur doit chercher "Code NAF 9602A"  
❌ Doit connaître la nomenclature technique  
❌ Une seule façon de chercher  

### Après (avec recherche sémantique) :
✅ Utilisateur tape "coiffeur", "salon de coiffure", "coiffure"  
✅ Synonymes reconnus : "coiff", "salon"  
✅ Concepts associés : "services de beauté"  
✅ Résultat : Codes NAF 9602A + 9602B automatiquement  

## 🚀 Prochaines améliorations possibles

1. **Machine Learning** : Améliorer le mapping basé sur l'usage
2. **Géolocalisation** : Termes spécifiques par région
3. **Secteurs verticaux** : Vocabulaires métiers spécialisés
4. **Analytics** : Suivi des termes les plus recherchés
5. **API enrichie** : Intégration avec d'autres sources de données

---

## ✅ **Intégration terminée avec succès !**

La recherche sémantique est maintenant **pleinement fonctionnelle** dans votre application Prosperian. Les utilisateurs peuvent utiliser des termes naturels pour trouver des entreprises plus facilement et plus intuitivement. 
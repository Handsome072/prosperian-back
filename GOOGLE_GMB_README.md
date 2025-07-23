# 🗺️ Intégration Google GMB (Google My Business) - Documentation

## 📋 Vue d'ensemble

Cette intégration permet de rechercher des entreprises via Google Places en utilisant l'API Apify dans votre application Prosperian. Les utilisateurs peuvent maintenant filtrer les entreprises par activité Google au lieu d'utiliser uniquement les codes NAF.

## 🚀 Fonctionnalités

✅ **Onglet "Activité Google (GMB)"** dans les filtres d'entreprises  
✅ **Catégories pré-définies** : Restaurant, Café, Boulangerie, Coiffeur, etc.  
✅ **Recherche libre** : Tapez n'importe quelle activité  
✅ **Localisation** : Filtrage par ville  
✅ **Données enrichies** : Notes Google, nombre d'avis, coordonnées GPS  
✅ **Mode démo** : Fonctionne avec des données fictives pendant les tests  

## 🔧 Configuration Backend

### 1. Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
APIFY_TOKEN=votre_token_apify_ici
```

### 2. Fichiers créés/modifiés

- `src/config/apify.js` - Configuration et service Apify
- `src/routes/google-places.js` - Routes API pour Google Places
- `src/index.js` - Ajout des routes Google Places

### 3. Endpoints API

#### Recherche simple
```
GET /api/google-places/search?activity=restaurant&location=Paris&limit=50
```

#### Recherche avancée
```
POST /api/google-places/search-advanced
{
  "activities": ["restaurant", "café"],
  "location": "Paris",
  "limit": 50,
  "combine_results": true
}
```

#### Catégories disponibles
```
GET /api/google-places/categories
```

## 🎨 Configuration Frontend

### 1. Fichiers créés/modifiés

- `src/services/googlePlacesService.ts` - Service frontend
- `src/entities/Business.ts` - Types étendus pour Google GMB
- `src/shared/components/Sidebar/FiltersPanel.tsx` - Interface utilisateur
- `src/pages/Recherche/Entreprises/index.tsx` - Intégration des résultats

### 2. Types de recherche disponibles

- **Code NAF** : Recherche classique par codes INSEE
- **Activité Google (GMB)** : 🆕 Recherche via Google Places
- **Sémantique** : Recherche par mots-clés intelligents (à venir)
- **Enseigne/Franchise** : Recherche par nom d'enseigne (à venir)

## 🎯 Comment utiliser

### 1. Interface utilisateur

1. **Ouvrez l'application** → Page Entreprises
2. **Cliquez sur "Activité Google (GMB)"** dans les filtres
3. **Sélectionnez une catégorie** ou tapez une activité
4. **Cliquez "Ajouter cette activité"**
5. **Les résultats s'affichent automatiquement**

### 2. Données retournées

Chaque entreprise Google Places contient :

```json
{
  "siren": "google_ChIJ...",
  "nom_complet": "Restaurant Le Gourmet 1",
  "activite_principale": "Restaurant",
  "adresse_complete": "11 Rue de la Paris, Paris",
  "ville": "Paris",
  "code_postal": "75008",
  "telephone": "01 42 15 25 35",
  "site_web": "https://www.restaurantlegourmet.fr",
  "google_rating": 4.2,
  "google_reviews_count": 156,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "source": "google_places"
}
```

## 🛠️ Mode Démo vs Production

### Mode Démo (Actuel)
- Données fictives mais réalistes
- Réponse immédiate (1 seconde)
- Parfait pour tester l'interface

### Mode Production (avec token Apify valide)
- Vraies données Google Places
- Temps de réponse variable (30s-2min)
- Données en temps réel

## 🔄 Passer en Mode Production

### 1. Obtenir un token Apify valide

1. Créez un compte sur [apify.com](https://apify.com)
2. Allez dans **Settings → Integrations**
3. Copiez votre **API Token**

### 2. Remplacer le code de démo

Dans `prosperian-back/src/config/apify.js`, remplacez la fonction `searchGooglePlaces` par :

```javascript
const searchGooglePlaces = async (searchQuery, location = "France", maxResults = 50) => {
  try {
    console.log('🔍 Recherche Google Places via Apify:', { searchQuery, location, maxResults });

    const inputData = {
      searchTermsArray: [searchQuery],
      locationQuery: location,
      maxResults: maxResults,
      language: 'fr',
      countryCode: 'FR',
      includeImages: false,
      includeReviews: false
    };

    const response = await apifyClient.post(
      `/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=300`,
      inputData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 300000
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Erreur Apify:', error.message);
    throw error;
  }
};
```

### 3. Mettre à jour les variables d'environnement

```env
APIFY_TOKEN=votre_vrai_token_ici
```

## 🐛 Résolution de problèmes

### Problème : "Aucune entreprise trouvée"

**Solutions :**
1. Vérifiez que le serveur backend fonctionne (port 4000)
2. Testez l'API directement : `curl "http://localhost:4000/api/google-places/search?activity=restaurant&location=Paris&limit=3"`
3. Vérifiez les logs du serveur backend

### Problème : "Request failed with status code 404" (Mode Production)

**Solutions :**
1. Vérifiez votre token Apify
2. Vérifiez l'ID de l'acteur (`compass~crawler-google-places`)
3. Assurez-vous d'avoir des crédits Apify

### Problème : Filtres ne se déclenchent pas

**Solutions :**
1. Vérifiez que `activitySearchType` est défini dans les filtres
2. Assurez-vous que `googleActivities` est un tableau
3. Redémarrez le serveur frontend

## 📊 Monitoring et Performance

### Logs à surveiller

```bash
# Backend
🔍 Recherche Google Places via Apify (MODE DEMO)
✅ 3 entreprises générées pour la démonstration

# Frontend  
🔍 Recherche via Google Places pour: ["restaurant"]
✅ 3 entreprises trouvées via Google Places
```

### Métriques importantes

- **Temps de réponse** : ~1s (démo) / 30s-2min (production)
- **Taux de succès** : Doit être > 95%
- **Coût Apify** : ~$4/1000 résultats en production

## 🔮 Prochaines étapes

1. **Valider le token Apify** pour passer en production
2. **Ajouter la recherche sémantique** avec intelligence artificielle
3. **Implémenter les filtres d'enseigne/franchise**
4. **Ajouter la géolocalisation avancée**
5. **Optimiser les performances** avec mise en cache

## 🆘 Support

Pour toute question ou problème :

1. **Vérifiez cette documentation**
2. **Consultez les logs du serveur**
3. **Testez l'API directement avec curl**
4. **Contactez l'équipe de développement**

---

**🎉 L'intégration Google GMB est maintenant opérationnelle ! Vous pouvez commencer à tester les filtres d'activités Google dans votre application.** 
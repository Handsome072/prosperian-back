# 🎯 Guide d'Utilisation Swagger UI - LinkedIn Sales Navigator

## 📋 Vue d'ensemble

Ce guide vous explique comment utiliser correctement l'interface Swagger UI pour tester les endpoints LinkedIn Sales Navigator, en évitant les erreurs de syntaxe JSON courantes.

## 🔗 Accès à Swagger UI

**URL :** `http://localhost:4000/api-docs`

## 🚀 Endpoints Disponibles

### **1. Extraction du SessionId**
- **Endpoint :** `POST /api/linkedin-sales/extract-session`
- **Fonction :** Extrait le sessionId d'une URL LinkedIn Sales Navigator

### **2. Génération d'URL avec SessionId**
- **Endpoint :** `POST /api/linkedin-sales/generate-url-with-session`
- **Fonction :** Génère une URL LinkedIn Sales Navigator avec sessionId

### **3. Autres Endpoints**
- `GET /api/linkedin-sales/filter-types` - Types de filtres disponibles
- `POST /api/linkedin-sales/generate-url` - Génération d'URL sans sessionId
- `POST /api/linkedin-sales/parse-url` - Parsing d'URL LinkedIn
- `POST /api/linkedin-sales/validate-filters` - Validation des filtres

## 🎯 Comment Tester les Endpoints

### **Étape 1 : Extraction du SessionId**

1. **Ouvrez Swagger UI** : `http://localhost:4000/api-docs`

2. **Trouvez l'endpoint** : `POST /api/linkedin-sales/extract-session`

3. **Cliquez sur "Try it out"**

4. **Utilisez l'exemple fourni** ou entrez votre propre URL :
   ```json
   {
     "url": "https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:\"Hyundai Motor Company\",selectionType:INCLUDED)))))&sessionId=oyT4SvXfQXWQEbOH54crEQ%3D%3D"
   }
   ```

5. **Cliquez sur "Execute"**

### **Étape 2 : Génération d'URL avec SessionId**

1. **Trouvez l'endpoint** : `POST /api/linkedin-sales/generate-url-with-session`

2. **Cliquez sur "Try it out"**

3. **Utilisez l'exemple fourni** ou créez votre propre requête :
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
       }
     ],
     "sessionId": "oyT4SvXfQXWQEbOH54crEQ%3D%3D",
     "viewAllFilters": false
   }
   ```

4. **Cliquez sur "Execute"**

## ⚠️ Erreurs Courantes et Solutions

### **Erreur 1 : SyntaxError JSON**

**Problème :**
```json
{
  "type": ""CURRENT_COMPANY""
}
```

**Solution :**
```json
{
  "type": "CURRENT_COMPANY"
}
```

**Explication :** Les guillemets doubles en trop causent une erreur de syntaxe JSON.

### **Erreur 2 : Champs Manquants**

**Problème :** Champs requis manquants
**Solution :** Assurez-vous d'inclure tous les champs requis :
- `searchType` (pour generate-url-with-session)
- `url` (pour extract-session)
- `sessionId` (pour generate-url-with-session)

### **Erreur 3 : Valeurs Enum Incorrectes**

**Problème :** Valeur non autorisée pour `searchType`
**Solution :** Utilisez seulement :
- `"people"` pour les prospects
- `"company"` pour les entreprises

## 🎨 Exemples Complets

### **Exemple 1 : Extraction de SessionId**

```json
{
  "url": "https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:\"Hyundai Motor Company\",selectionType:INCLUDED)))))&sessionId=oyT4SvXfQXWQEbOH54crEQ%3D%3D"
}
```

**Réponse attendue :**
```json
{
  "success": true,
  "sessionId": "oyT4SvXfQXWQEbOH54crEQ%3D%3D",
  "decodedSessionId": "oyT4SvXfQXWQEbOH54crEQ==",
  "message": "SessionId extrait avec succès"
}
```

### **Exemple 2 : Génération d'URL Simple**

```json
{
  "searchType": "people",
  "keywords": "développeur",
  "sessionId": "oyT4SvXfQXWQEbOH54crEQ%3D%3D"
}
```

**Réponse attendue :**
```json
{
  "success": true,
  "url": "https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled%3Atrue%2Ckeywords%3Ad%C3%A9veloppeur)&sessionId=oyT4SvXfQXWQEbOH54crEQ%253D%253D",
  "searchType": "people",
  "sessionId": "oyT4SvXfQXWQEbOH54crEQ%3D%3D",
  "filters": [],
  "message": "URL de recherche LinkedIn Sales Navigator générée avec sessionId pour les prospects"
}
```

### **Exemple 3 : Génération d'URL Complexe**

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
      "type": "REGION",
      "values": [
        {
          "id": "urn:li:region:84",
          "text": "Auvergne-Rhône-Alpes",
          "selectionType": "INCLUDED"
        }
      ]
    }
  ],
  "sessionId": "oyT4SvXfQXWQEbOH54crEQ%3D%3D",
  "viewAllFilters": true
}
```

## 🔧 Types de Filtres Disponibles

### **Pour les Prospects (`people`) :**
- `CURRENT_COMPANY` - Entreprise actuelle
- `PAST_COMPANY` - Ancienne entreprise
- `COMPANY_HEADCOUNT` - Taille de l'entreprise
- `FUNCTION` - Fonction/Rôle
- `CURRENT_TITLE` - Titre actuel
- `SENIORITY_LEVEL` - Niveau de séniorité
- `REGION` - Région géographique
- `POSTAL_CODE` - Code postal
- `INDUSTRY` - Secteur d'activité

### **Pour les Entreprises (`company`) :**
- `ANNUAL_REVENUE` - Chiffre d'affaires
- `COMPANY_HEADCOUNT` - Taille de l'entreprise
- `COMPANY_HEADCOUNT_GROWTH` - Croissance
- `INDUSTRY` - Secteur d'activité
- `REGION` - Région géographique
- `POSTAL_CODE` - Code postal

## 🎯 Conseils d'Utilisation

### **1. Commencez Simple**
- Testez d'abord avec des requêtes simples (sans filtres)
- Ajoutez progressivement les filtres

### **2. Vérifiez la Syntaxe**
- Assurez-vous que tous les guillemets sont corrects
- Vérifiez les virgules et accolades

### **3. Utilisez les Exemples**
- Les exemples fournis dans Swagger UI sont testés et fonctionnels
- Copiez et modifiez selon vos besoins

### **4. Testez les Erreurs**
- Essayez des valeurs incorrectes pour voir les messages d'erreur
- Cela vous aide à comprendre les validations

## 🚀 Workflow Recommandé

1. **Extrayez un SessionId** d'une URL LinkedIn Sales Navigator existante
2. **Générez de nouvelles URLs** avec ce sessionId
3. **Testez différents filtres** pour vos besoins
4. **Validez vos filtres** avant utilisation
5. **Utilisez les URLs générées** pour le scraping

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez la syntaxe JSON** dans Swagger UI
2. **Consultez les exemples** fournis
3. **Testez avec des requêtes simples** d'abord
4. **Vérifiez que le serveur fonctionne** : `http://localhost:4000`

---

**✅ Avec ce guide, vous devriez pouvoir utiliser efficacement l'interface Swagger UI pour tester tous les endpoints LinkedIn Sales Navigator !** 
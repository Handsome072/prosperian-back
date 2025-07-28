# 🔐 API d'Authentification - Prosperian Backend

Ce document décrit les APIs d'authentification et de gestion des utilisateurs pour le backend Prosperian.

## 📋 Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [APIs d'Authentification](#apis-dauthentification)
- [APIs de Gestion des Utilisateurs](#apis-de-gestion-des-utilisateurs)
- [Middleware d'Authentification](#middleware-dauthentification)
- [Exemples d'Utilisation](#exemples-dutilisation)
- [Sécurité](#sécurité)

## 🚀 Installation

Les dépendances nécessaires ont été installées :

```bash
npm install bcryptjs jsonwebtoken
```

## ⚙️ Configuration

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# JWT Configuration
JWT_SECRET=votre-secret-jwt-super-securise
JWT_EXPIRES_IN=24h

# Supabase Configuration (déjà configuré)
SUPABASE_URL=votre-url-supabase
SUPABASE_KEY=votre-cle-supabase
```

## 🔑 APIs d'Authentification

### Base URL
```
http://localhost:4000/api/auth
```

### 1. Inscription (Register)

**Endpoint :** `POST /api/auth/register`

**Description :** Créer un nouveau compte utilisateur

**Body :**
```json
{
  "email": "user@example.com",
  "mot_de_passe": "password123",
  "prenom": "John",
  "nom": "Doe",
  "telephone": "+33123456789",
  "role": "user"
}
```

**Réponse de succès (201) :**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "prenom": "John",
    "nom": "Doe",
    "telephone": "+33123456789",
    "role": "user",
    "date_creation": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token",
  "expiresIn": "24h"
}
```

### 2. Connexion (Login)

**Endpoint :** `POST /api/auth/login`

**Description :** Se connecter avec email et mot de passe

**Body :**
```json
{
  "email": "user@example.com",
  "mot_de_passe": "password123"
}
```

**Réponse de succès (200) :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "prenom": "John",
    "nom": "Doe",
    "telephone": "+33123456789",
    "role": "user",
    "date_creation": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token",
  "expiresIn": "24h"
}
```

### 3. Profil Utilisateur

**Endpoint :** `GET /api/auth/me`

**Description :** Récupérer les informations de l'utilisateur connecté

**Headers :**
```
Authorization: Bearer <jwt-token>
```

**Réponse de succès (200) :**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "prenom": "John",
    "nom": "Doe",
    "telephone": "+33123456789",
    "role": "user",
    "date_creation": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Rafraîchissement de Token

**Endpoint :** `POST /api/auth/refresh`

**Description :** Rafraîchir un token JWT expiré

**Headers :**
```
Authorization: Bearer <jwt-token>
```

**Réponse de succès (200) :**
```json
{
  "success": true,
  "message": "Token rafraîchi avec succès",
  "token": "nouveau-jwt-token",
  "expiresIn": "24h"
}
```

## 👥 APIs de Gestion des Utilisateurs

### Base URL
```
http://localhost:4000/api/utilisateur
```

### 1. Profil Personnel

**Endpoint :** `GET /api/utilisateur/profile`

**Description :** Récupérer son propre profil

**Headers :**
```
Authorization: Bearer <jwt-token>
```

### 2. Mise à Jour du Profil

**Endpoint :** `PUT /api/utilisateur/profile`

**Description :** Mettre à jour son propre profil

**Headers :**
```
Authorization: Bearer <jwt-token>
```

**Body :**
```json
{
  "prenom": "John",
  "nom": "Doe",
  "telephone": "+33123456789"
}
```

### 3. Changement de Mot de Passe

**Endpoint :** `PUT /api/utilisateur/password`

**Description :** Changer son mot de passe

**Headers :**
```
Authorization: Bearer <jwt-token>
```

**Body :**
```json
{
  "currentPassword": "ancien-mot-de-passe",
  "newPassword": "nouveau-mot-de-passe"
}
```

### 4. Liste des Utilisateurs (Admin)

**Endpoint :** `GET /api/utilisateur`

**Description :** Récupérer tous les utilisateurs (admin seulement)

**Headers :**
```
Authorization: Bearer <jwt-token>
```

### 5. Utilisateur par ID

**Endpoint :** `GET /api/utilisateur/:id`

**Description :** Récupérer un utilisateur par ID (admin ou propriétaire)

**Headers :**
```
Authorization: Bearer <jwt-token>
```

### 6. Mise à Jour Utilisateur

**Endpoint :** `PUT /api/utilisateur/:id`

**Description :** Mettre à jour un utilisateur (admin ou propriétaire)

**Headers :**
```
Authorization: Bearer <jwt-token>
```

**Body :**
```json
{
  "prenom": "John",
  "nom": "Doe",
  "telephone": "+33123456789",
  "role": "admin"
}
```

### 7. Suppression Utilisateur (Admin)

**Endpoint :** `DELETE /api/utilisateur/:id`

**Description :** Supprimer un utilisateur (admin seulement)

**Headers :**
```
Authorization: Bearer <jwt-token>
```

## 🛡️ Middleware d'Authentification

### Utilisation dans les Routes

```javascript
const { authenticateToken, authorizeRoles, authorizeOwner } = require('../middleware/auth');

// Route protégée - authentification requise
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contient les informations de l'utilisateur
  res.json({ user: req.user });
});

// Route avec autorisation de rôle
router.get('/admin-only', authenticateToken, authorizeRoles(['admin']), (req, res) => {
  res.json({ message: 'Accès admin autorisé' });
});

// Route avec autorisation de propriétaire
router.put('/resource/:id', authenticateToken, authorizeOwner('user_id'), (req, res) => {
  res.json({ message: 'Ressource mise à jour' });
});
```

### Middleware Disponibles

1. **`authenticateToken`** : Vérifie le token JWT
2. **`authorizeRoles(roles)`** : Vérifie les rôles utilisateur
3. **`authorizeOwner(field)`** : Vérifie la propriété de la ressource

## 📝 Exemples d'Utilisation

### JavaScript/Fetch

```javascript
// Inscription
const registerUser = async (userData) => {
  const response = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Connexion
const loginUser = async (credentials) => {
  const response = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

// Requête protégée
const getProfile = async (token) => {
  const response = await fetch('http://localhost:4000/api/utilisateur/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### Axios

```javascript
import axios from 'axios';

// Configuration avec token
const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Utilisation
const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/utilisateur/profile'),
  updateProfile: (data) => api.put('/utilisateur/profile', data)
};
```

## 🔒 Sécurité

### Bonnes Pratiques

1. **Stockage sécurisé des tokens** : Utilisez `httpOnly` cookies ou stockage sécurisé
2. **Expiration des tokens** : Configurez une expiration appropriée
3. **Validation des entrées** : Toutes les entrées sont validées
4. **Hachage des mots de passe** : Utilisation de bcrypt avec salt
5. **Gestion des erreurs** : Messages d'erreur sécurisés

### Validation des Données

- **Email** : Format email valide
- **Mot de passe** : Minimum 6 caractères
- **Téléphone** : Format optionnel
- **Rôles** : 'user', 'admin' (par défaut: 'user')

### Codes d'Erreur

- **400** : Données invalides
- **401** : Non authentifié
- **403** : Accès refusé
- **404** : Ressource non trouvée
- **409** : Conflit (utilisateur existant)
- **500** : Erreur serveur

## 🧪 Tests

### Test d'Inscription

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "mot_de_passe": "password123",
    "prenom": "Test",
    "nom": "User"
  }'
```

### Test de Connexion

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "mot_de_passe": "password123"
  }'
```

### Test de Route Protégée

```bash
curl -X GET http://localhost:4000/api/utilisateur/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Structure de la Base de Données

### Table `utilisateur`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique (clé primaire) |
| email | TEXT | Email unique (requis) |
| mot_de_passe | TEXT | Mot de passe hashé (requis) |
| prenom | TEXT | Prénom (optionnel) |
| nom | TEXT | Nom (optionnel) |
| telephone | TEXT | Numéro de téléphone (optionnel) |
| role | TEXT | Rôle utilisateur (optionnel, défaut: 'user') |
| date_creation | TIMESTAMP | Date de création (automatique) |

## 🚀 Démarrage

1. Assurez-vous que les variables d'environnement sont configurées
2. Démarrez le serveur : `npm run dev`
3. Testez les endpoints avec les exemples ci-dessus

L'API d'authentification est maintenant prête à être utilisée dans votre application frontend ! 
# 🚀 Système de Déploiement Automatique Backend

Ce système permet de déployer automatiquement le backend Prosperian à chaque push sur la branche `main` du repository GitHub.

## 📁 Structure des fichiers

```
backend/
├── deploy.sh                    # Script de déploiement principal
├── setup-deployment.sh          # Script d'installation
├── deployment/
│   ├── package.json             # Dépendances du webhook
│   └── webhook-server.js        # Serveur webhook
└── DEPLOYMENT_README.md         # Ce fichier
```

## 🛠️ Installation sur le serveur

### 1. Pousser les fichiers sur GitHub

Assurez-vous que tous les fichiers de déploiement sont dans votre repository backend et poussés sur GitHub.

### 2. Sur le serveur, aller dans le dossier backend

```bash
cd /var/www/backend
```

### 3. Exécuter le script d'installation

```bash
chmod +x setup-deployment.sh
./setup-deployment.sh
```

## ⚙️ Configuration GitHub

### 1. Accéder aux paramètres du repository

1. Allez sur votre repository backend GitHub
2. Cliquez sur **Settings**
3. Dans le menu de gauche, cliquez sur **Webhooks**
4. Cliquez sur **Add webhook**

### 2. Configurer le webhook

- **Payload URL**: `http://69.62.105.91:9000/webhook-backend`
- **Content type**: `application/json`
- **Secret**: (laisser vide pour l'instant)
- **Which events**: Sélectionnez "Just the push event"
- **Active**: ✅ Coché

### 3. Sauvegarder

Cliquez sur **Add webhook**

## 🧪 Test du système

### 1. Vérifier que le webhook fonctionne

```bash
curl -X GET http://69.62.105.91:9000/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "message": "Webhook backend server is running",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
  "version": "1.0.0"
}
```

### 2. Test de déploiement manuel

```bash
curl -X POST http://69.62.105.91:9000/deploy-manual
```

### 3. Tester le déploiement automatique

1. Faites une modification dans votre code backend
2. Commitez et pushez sur la branche `main`
3. Le déploiement devrait se déclencher automatiquement

### 4. Vérifier les logs

```bash
# Logs du webhook
pm2 logs webhook-backend

# Logs du backend
pm2 logs prosperian-backend

# Statut des services
pm2 status
```

## 🔧 Commandes utiles

### Gestion du webhook

```bash
# Redémarrer le webhook
pm2 restart webhook-backend

# Voir les logs en temps réel
pm2 logs webhook-backend --lines 50

# Arrêter le webhook
pm2 stop webhook-backend

# Supprimer le webhook
pm2 delete webhook-backend
```

### Déploiement manuel

```bash
# Exécuter le déploiement manuellement
./deploy.sh

# Ou via l'API
curl -X POST http://69.62.105.91:9000/deploy-manual
```

### Debug

```bash
# Tester le webhook manuellement
curl -X POST http://69.62.105.91:9000/webhook-backend \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main","repository":{"name":"test"},"pusher":{"name":"test"}}'
```

## 📊 Endpoints disponibles

### Health Check
- **URL**: `GET /health`
- **Description**: Vérifier que le webhook fonctionne
- **Réponse**: Status du service

### Webhook GitHub
- **URL**: `POST /webhook-backend`
- **Description**: Endpoint pour les notifications GitHub
- **Déclencheur**: Push sur la branche `main`

### Déploiement manuel
- **URL**: `POST /deploy-manual`
- **Description**: Déclencher un déploiement manuellement
- **Usage**: Pour tester ou déployer sans push

## 🛡️ Sécurité

### Recommandations

1. **Ajouter un secret GitHub** pour sécuriser le webhook
2. **Configurer un firewall** pour limiter l'accès au port 9000
3. **Utiliser HTTPS** en production avec un certificat SSL
4. **Ajouter des logs détaillés** pour le monitoring

### Amélioration avec secret GitHub

Pour ajouter la vérification du secret, modifiez `webhook-server.js` :

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const digest = 'sha256=' + hmac.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Dans la route webhook
const signature = req.headers['x-hub-signature-256'];
const payload = JSON.stringify(req.body);
if (!verifySignature(payload, signature, process.env.GITHUB_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
}
```

## 🚨 Dépannage

### Le webhook ne répond pas

1. Vérifier que le service est démarré : `pm2 status`
2. Vérifier les logs : `pm2 logs webhook-backend`
3. Tester la connectivité : `curl http://localhost:9000/health`

### Le déploiement échoue

1. Vérifier les permissions : `ls -la deploy.sh`
2. Tester le script manuellement : `./deploy.sh`
3. Vérifier les logs PM2 : `pm2 logs prosperian-backend`

### GitHub ne peut pas atteindre le webhook

1. Vérifier que le port 9000 est ouvert
2. Tester depuis l'extérieur : `curl http://69.62.105.91:9000/health`
3. Vérifier la configuration du firewall

## 📞 Support

En cas de problème, vérifiez :
1. Les logs PM2 : `pm2 logs`
2. Les logs système : `journalctl -u pm2-root`
3. La connectivité réseau : `netstat -tlnp | grep 9000`

## 🔄 Workflow de déploiement

1. **Développement local** → Modification du code
2. **Git push** → Push vers la branche `main`
3. **GitHub webhook** → Notification envoyée au serveur
4. **Webhook server** → Réception et validation
5. **Deploy script** → Exécution du déploiement
6. **PM2 restart** → Redémarrage de l'application
7. **Logs** → Vérification du succès

# 🚀 Guide Rapide - Déploiement Automatique

## Installation en 3 étapes

### 1. Sur le serveur
```bash
cd /var/www/backend
chmod +x setup-deployment.sh
./setup-deployment.sh
```

### 2. Sur GitHub
- Repository Settings > Webhooks > Add webhook
- URL: `http://69.62.105.91:9000/webhook-backend`
- Content type: `application/json`
- Events: "Just the push event"

### 3. Test
```bash
# Test du webhook
curl http://69.62.105.91:9000/health

# Test de déploiement manuel
curl -X POST http://69.62.105.91:9000/deploy-manual
```

## Commandes NPM disponibles

```bash
# Déploiement
npm run deploy                 # Déploiement manuel
npm run setup-deployment       # Installation du système

# Gestion du webhook
npm run webhook:install        # Installer les dépendances
npm run webhook:start          # Démarrer le webhook
npm run webhook:stop           # Arrêter le webhook
npm run webhook:restart        # Redémarrer le webhook
npm run webhook:logs           # Voir les logs
npm run webhook:status         # Statut du webhook
```

## URLs importantes

- **Webhook**: http://69.62.105.91:9000/webhook-backend
- **Health**: http://69.62.105.91:9000/health
- **Manual Deploy**: http://69.62.105.91:9000/deploy-manual

## Workflow

1. **Push** vers `main` → GitHub webhook → Déploiement automatique
2. **Manual**: `npm run deploy` ou `curl -X POST .../deploy-manual`
3. **Logs**: `npm run webhook:logs` ou `pm2 logs webhook-backend`

## Dépannage rapide

```bash
# Vérifier les services
pm2 status

# Redémarrer tout
pm2 restart all

# Logs détaillés
pm2 logs --lines 50

# Test complet
./test-deployment.sh
```

#!/bin/bash

# Script d'installation du système de déploiement automatique pour le backend Prosperian
# À exécuter depuis le dossier /var/www/backend

echo "🚀 Installation du système de déploiement automatique backend..."

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le dossier backend (/var/www/backend)"
    exit 1
fi

# 1. Rendre le script de déploiement exécutable
echo "📋 Configuration du script de déploiement..."
chmod +x deploy.sh

# 2. Aller dans le dossier deployment
echo "📁 Configuration du webhook..."
cd deployment

# 3. Installer les dépendances du webhook
echo "📦 Installation des dépendances webhook..."
npm install

# 4. Arrêter le webhook s'il existe déjà
echo "🔄 Arrêt du webhook existant (si présent)..."
pm2 stop webhook-backend 2>/dev/null || true
pm2 delete webhook-backend 2>/dev/null || true

# 5. Démarrer le webhook avec PM2
echo "🚀 Démarrage du webhook avec PM2..."
pm2 start webhook-server.js --name webhook-backend

# 6. Sauvegarder la configuration PM2
echo "💾 Sauvegarde de la configuration PM2..."
pm2 save

# 7. Vérifier le statut
echo "✅ Vérification du statut..."
pm2 status

# 8. Tester le webhook
echo "🧪 Test du webhook..."
sleep 2
curl -X GET http://localhost:9000/health

echo ""
echo "🎉 Installation terminée avec succès !"
echo ""
echo "📝 Configuration GitHub requise :"
echo "1. Aller sur GitHub dans votre repository backend"
echo "2. Settings > Webhooks > Add webhook"
echo "3. URL: http://69.62.105.91:9000/webhook-backend"
echo "4. Content type: application/json"
echo "5. Events: Just the push event"
echo "6. Active: ✓"
echo ""
echo "🔗 URLs disponibles :"
echo "   Webhook: http://69.62.105.91:9000/webhook-backend"
echo "   Health:  http://69.62.105.91:9000/health"
echo "   Manual:  http://69.62.105.91:9000/deploy-manual"
echo ""
echo "🛠️ Commandes utiles :"
echo "   pm2 logs webhook-backend    # Voir les logs"
echo "   pm2 restart webhook-backend # Redémarrer"
echo "   ./deploy.sh                 # Déploiement manuel"

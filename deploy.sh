#!/bin/bash

# Script de déploiement automatique pour le backend Prosperian
# Ce script sera exécuté à chaque push sur la branche main

echo "🚀 Début du déploiement backend..."

# Aller dans le dossier backend
cd /var/www/backend

# Sauvegarder les modifications locales et récupérer les dernières modifications
echo "📥 Récupération des dernières modifications..."
git reset --hard
git pull origin main

# Installer les dépendances (production uniquement)
echo "📦 Installation des dépendances..."
npm install --omit=dev

# Redémarrer l'application avec PM2
echo "🔄 Redémarrage de l'application..."
pm2 restart prosperian-backend

# Vérifier le statut
echo "✅ Vérification du statut..."
pm2 status prosperian-backend

echo "🎉 Déploiement terminé avec succès !"

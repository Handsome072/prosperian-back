#!/bin/bash

# Script pour rendre tous les scripts exécutables

echo "🔐 Configuration des permissions d'exécution..."

chmod +x deploy.sh
chmod +x setup-deployment.sh
chmod +x test-deployment.sh
chmod +x make-executable.sh

echo "✅ Tous les scripts sont maintenant exécutables !"

ls -la *.sh

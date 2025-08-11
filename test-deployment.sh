#!/bin/bash

# Script de test pour le système de déploiement automatique

echo "🧪 Test du système de déploiement automatique..."

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Test 1: Vérifier que les fichiers existent
echo -e "${YELLOW}📁 Vérification des fichiers...${NC}"
test -f "deploy.sh" && print_result 0 "deploy.sh existe" || print_result 1 "deploy.sh manquant"
test -f "setup-deployment.sh" && print_result 0 "setup-deployment.sh existe" || print_result 1 "setup-deployment.sh manquant"
test -f "deployment/webhook-server.js" && print_result 0 "webhook-server.js existe" || print_result 1 "webhook-server.js manquant"
test -f "deployment/package.json" && print_result 0 "deployment/package.json existe" || print_result 1 "deployment/package.json manquant"

# Test 2: Vérifier les permissions
echo -e "${YELLOW}🔐 Vérification des permissions...${NC}"
test -x "deploy.sh" && print_result 0 "deploy.sh est exécutable" || print_result 1 "deploy.sh n'est pas exécutable"
test -x "setup-deployment.sh" && print_result 0 "setup-deployment.sh est exécutable" || print_result 1 "setup-deployment.sh n'est pas exécutable"

# Test 3: Vérifier la syntaxe des scripts
echo -e "${YELLOW}📝 Vérification de la syntaxe...${NC}"
bash -n deploy.sh && print_result 0 "deploy.sh syntaxe OK" || print_result 1 "deploy.sh erreur de syntaxe"
bash -n setup-deployment.sh && print_result 0 "setup-deployment.sh syntaxe OK" || print_result 1 "setup-deployment.sh erreur de syntaxe"

# Test 4: Vérifier la configuration Node.js
echo -e "${YELLOW}🟢 Vérification Node.js...${NC}"
cd deployment
npm list express > /dev/null 2>&1 && print_result 0 "Express installé" || print_result 1 "Express manquant"
cd ..

# Test 5: Vérifier PM2
echo -e "${YELLOW}⚙️ Vérification PM2...${NC}"
which pm2 > /dev/null 2>&1 && print_result 0 "PM2 disponible" || print_result 1 "PM2 manquant"

# Test 6: Test de connectivité (si le webhook est démarré)
echo -e "${YELLOW}🌐 Test de connectivité...${NC}"
curl -s http://localhost:9000/health > /dev/null 2>&1 && print_result 0 "Webhook répond" || print_result 1 "Webhook ne répond pas"

echo ""
echo -e "${YELLOW}📊 Résumé du test terminé${NC}"
echo "Consultez les résultats ci-dessus pour identifier les problèmes éventuels."

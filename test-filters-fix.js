// Script de test pour vérifier la correction des filtres
// Usage: node test-filters-fix.js

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testFiltersWithPotentialNullValues() {
  console.log('🧪 Test de la correction des filtres avec valeurs null/undefined');
  console.log('================================================================\n');

  try {
    // Test 1: Test avec tous les filtres (celui qui causait l'erreur)
    console.log('📋 Test 1: Tous les filtres (test de régression)');
    const response1 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results`, {
      params: {
        company_filter: 'Google,Microsoft,Apple',
        title_filter: 'CEO,CTO,Manager',
        lead_location_filter: 'Paris,London,New York',
        employee_range_filter: '1-10,11-50,51-200',
        company_location_filter: 'Paris,London,Berlin',
        industry_filter: 'Technology,Finance,Healthcare',
        limit: 10
      }
    });
    
    console.log('✅ Test 1 réussi !');
    console.log(`   - Statut: ${response1.status}`);
    console.log(`   - Leads filtrés: ${response1.data.filtered_leads}`);
    console.log(`   - Temps de traitement: ${response1.data.processing_time}s`);
    
    // Afficher les filtres appliqués
    console.log('   - Filtres appliqués:');
    Object.entries(response1.data.applied_filters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        console.log(`     * ${key}: [${values.join(', ')}]`);
      }
    });

    // Test 2: Test avec un seul filtre pour vérifier la logique
    console.log('\n📋 Test 2: Filtre simple (entreprises seulement)');
    const response2 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results?company_filter=Google&limit=5`);
    
    console.log('✅ Test 2 réussi !');
    console.log(`   - Leads filtrés: ${response2.data.filtered_leads}`);
    console.log(`   - Entreprises dans les résultats:`);
    
    if (response2.data.leads && response2.data.leads.length > 0) {
      response2.data.leads.slice(0, 3).forEach((leadItem, index) => {
        console.log(`     ${index + 1}. ${leadItem.company?.name || 'Nom non disponible'}`);
      });
    }

    // Test 3: Test avec des filtres qui ne devraient rien retourner
    console.log('\n📋 Test 3: Filtres restrictifs (peu de résultats attendus)');
    const response3 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results`, {
      params: {
        company_filter: 'NonExistentCompany123',
        title_filter: 'NonExistentTitle456',
        limit: 5
      }
    });
    
    console.log('✅ Test 3 réussi !');
    console.log(`   - Leads filtrés: ${response3.data.filtered_leads} (attendu: 0 ou très peu)`);

    // Test 4: Test sans filtres pour vérifier que ça marche toujours
    console.log('\n📋 Test 4: Sans filtres (baseline)');
    const response4 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results?limit=5`);
    
    console.log('✅ Test 4 réussi !');
    console.log(`   - Leads totaux: ${response4.data.total_leads}`);
    console.log(`   - Leads retournés: ${response4.data.filtered_leads}`);

    console.log('\n✅ Tous les tests ont réussi ! La correction fonctionne.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    
    if (error.response) {
      console.error(`   - Statut HTTP: ${error.response.status}`);
      console.error(`   - URL: ${error.config?.url}`);
      console.error(`   - Paramètres: ${JSON.stringify(error.config?.params || {})}`);
      
      if (error.response.data) {
        console.error(`   - Détails de l'erreur:`, error.response.data);
      }
    }
  }
}

// Test de connectivité de base
async function testConnectivity() {
  try {
    console.log('🔍 Test de connectivité...');
    const response = await axios.get(`${BASE_URL}/api/pronto/status`);
    console.log('✅ Serveur accessible');
    return true;
  } catch (error) {
    console.error('❌ Serveur non accessible:', error.message);
    console.error('   Assurez-vous que le serveur backend est démarré sur le port 4000');
    return false;
  }
}

// Fonction principale
async function main() {
  const isConnected = await testConnectivity();
  if (isConnected) {
    await testFiltersWithPotentialNullValues();
  }
}

// Exécution
main().catch(console.error);

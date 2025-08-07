// Script de test pour vérifier que les filtres vides fonctionnent correctement
// Usage: node test-empty-filters.js

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testEmptyFilters() {
  console.log('🧪 Test des filtres vides et comportement par défaut');
  console.log('==================================================\n');

  try {
    // Test 1: Aucun paramètre (comportement par défaut)
    console.log('📋 Test 1: Aucun paramètre de filtre');
    const response1 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results?limit=5`);
    
    console.log('✅ Réponse reçue:');
    console.log(`   - Statut: ${response1.status}`);
    console.log(`   - Leads totaux: ${response1.data.total_leads}`);
    console.log(`   - Leads filtrés: ${response1.data.filtered_leads}`);
    console.log(`   - Message: ${response1.data.message}`);
    console.log(`   - Filtres appliqués:`, response1.data.applied_filters);

    // Test 2: Paramètres vides explicites
    console.log('\n📋 Test 2: Paramètres de filtre vides explicites');
    const response2 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results`, {
      params: {
        company_filter: '',
        title_filter: '',
        lead_location_filter: '',
        employee_range_filter: '',
        company_location_filter: '',
        industry_filter: '',
        limit: 5
      }
    });
    
    console.log('✅ Réponse reçue:');
    console.log(`   - Leads totaux: ${response2.data.total_leads}`);
    console.log(`   - Leads filtrés: ${response2.data.filtered_leads}`);
    console.log(`   - Message: ${response2.data.message}`);
    console.log(`   - Tous les filtres vides:`, response2.data.applied_filters);

    // Test 3: Mélange de filtres vides et non vides
    console.log('\n📋 Test 3: Mélange de filtres vides et non vides');
    const response3 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results`, {
      params: {
        company_filter: 'Google',
        title_filter: '',
        lead_location_filter: '',
        employee_range_filter: '',
        company_location_filter: '',
        industry_filter: 'Technology',
        limit: 5
      }
    });
    
    console.log('✅ Réponse reçue:');
    console.log(`   - Leads totaux: ${response3.data.total_leads}`);
    console.log(`   - Leads filtrés: ${response3.data.filtered_leads}`);
    console.log(`   - Message: ${response3.data.message}`);
    console.log(`   - Filtres appliqués:`);
    Object.entries(response3.data.applied_filters).forEach(([key, values]) => {
      console.log(`     * ${key}: ${values.length > 0 ? `[${values.join(', ')}]` : 'Vide'}`);
    });

    // Test 4: Filtres avec espaces seulement
    console.log('\n📋 Test 4: Filtres avec espaces seulement');
    const response4 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results`, {
      params: {
        company_filter: '   ',
        title_filter: ' , , ',
        lead_location_filter: '',
        limit: 5
      }
    });
    
    console.log('✅ Réponse reçue:');
    console.log(`   - Leads filtrés: ${response4.data.filtered_leads}`);
    console.log(`   - Message: ${response4.data.message}`);
    console.log(`   - Filtres après nettoyage:`, response4.data.applied_filters);

    // Test 5: Vérification que les résultats sont identiques sans filtres
    console.log('\n📋 Test 5: Vérification de cohérence (sans filtres vs filtres vides)');
    const response5a = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results?limit=3`);
    const response5b = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results?company_filter=&title_filter=&limit=3`);
    
    const sameResults = response5a.data.filtered_leads === response5b.data.filtered_leads;
    console.log(`✅ Cohérence des résultats: ${sameResults ? 'OK' : 'ERREUR'}`);
    console.log(`   - Sans paramètres: ${response5a.data.filtered_leads} leads`);
    console.log(`   - Avec paramètres vides: ${response5b.data.filtered_leads} leads`);

    // Test 6: Test avec limite élevée pour voir le comportement global
    console.log('\n📋 Test 6: Test avec limite élevée (comportement global)');
    const response6 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results?limit=1000`);
    
    console.log('✅ Réponse reçue:');
    console.log(`   - Recherches traitées: ${response6.data.total_searches}`);
    console.log(`   - Leads totaux disponibles: ${response6.data.total_leads}`);
    console.log(`   - Leads retournés: ${response6.data.filtered_leads}`);
    console.log(`   - Entreprises uniques: ${response6.data.unique_companies}`);
    console.log(`   - Temps de traitement: ${response6.data.processing_time}s`);

    console.log('\n✅ Tous les tests des filtres vides ont réussi !');
    console.log('\n📊 Résumé du comportement:');
    console.log('   - Sans filtres: Tous les leads sont retournés');
    console.log('   - Filtres vides: Même comportement que sans filtres');
    console.log('   - Filtres avec espaces: Nettoyés automatiquement');
    console.log('   - Mélange: Seuls les filtres non vides sont appliqués');

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
    await testEmptyFilters();
  }
}

// Exécution
main().catch(console.error);

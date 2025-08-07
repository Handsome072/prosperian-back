// Script de test pour l'endpoint workflow global
// Usage: node test-workflow-endpoint.js

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testWorkflowEndpoint() {
  console.log('🧪 Test de l\'endpoint workflow global Pronto');
  console.log('==============================================\n');

  try {
    // Test 1: Sans filtre
    console.log('📋 Test 1: Récupération de tous les leads sans filtre');
    const response1 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results?limit=10`);
    
    console.log('✅ Réponse reçue:');
    console.log(`   - Statut: ${response1.status}`);
    console.log(`   - Recherches traitées: ${response1.data.total_searches}`);
    console.log(`   - Leads totaux: ${response1.data.total_leads}`);
    console.log(`   - Leads filtrés: ${response1.data.filtered_leads}`);
    console.log(`   - Entreprises uniques: ${response1.data.unique_companies}`);
    console.log(`   - Temps de traitement: ${response1.data.processing_time}s`);
    console.log(`   - Message: ${response1.data.message}\n`);

    // Test 2: Avec filtres multiples
    console.log('📋 Test 2: Avec filtres multiples');
    const response2 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results?company_filter=Google,Microsoft&title_filter=CEO,CTO&industry_filter=Technology&limit=5`);
    
    console.log('✅ Réponse reçue:');
    console.log(`   - Statut: ${response2.status}`);
    console.log(`   - Recherches traitées: ${response2.data.total_searches}`);
    console.log(`   - Leads totaux: ${response2.data.total_leads}`);
    console.log(`   - Leads filtrés: ${response2.data.filtered_leads}`);
    console.log(`   - Entreprises uniques: ${response2.data.unique_companies}`);
    console.log(`   - Filtres appliqués:`);
    console.log(`     * Entreprises: [${response2.data.applied_filters.company_names.join(', ')}]`);
    console.log(`     * Titres: [${response2.data.applied_filters.titles.join(', ')}]`);
    console.log(`     * Secteurs: [${response2.data.applied_filters.industries.join(', ')}]`);
    console.log(`   - Temps de traitement: ${response2.data.processing_time}s`);
    console.log(`   - Message: ${response2.data.message}\n`);

    // Afficher quelques exemples de leads
    if (response2.data.leads && response2.data.leads.length > 0) {
      console.log('📊 Exemples de leads trouvés:');
      response2.data.leads.slice(0, 3).forEach((leadItem, index) => {
        console.log(`   ${index + 1}. ${leadItem.lead?.first_name} ${leadItem.lead?.last_name}`);
        console.log(`      - Entreprise: ${leadItem.company?.name}`);
        console.log(`      - Titre: ${leadItem.lead?.title}`);
        console.log(`      - Email: ${leadItem.lead?.most_probable_email}`);
        console.log(`      - Recherche: ${leadItem.search_name} (${leadItem.search_id})`);
      });
    }

    // Test 3: Avec détails des recherches
    console.log('\n📋 Test 3: Avec détails des recherches inclus');
    const response3 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results?include_search_details=true&limit=5`);
    
    console.log('✅ Réponse reçue:');
    console.log(`   - Détails des recherches inclus: ${response3.data.searches ? 'Oui' : 'Non'}`);
    if (response3.data.searches) {
      console.log(`   - Nombre de recherches détaillées: ${response3.data.searches.length}`);
      response3.data.searches.slice(0, 2).forEach((search, index) => {
        console.log(`     ${index + 1}. ${search.name} (${search.id})`);
        console.log(`        - Leads: ${search.leads_count}`);
        console.log(`        - Créée: ${search.created_at}`);
      });
    }

    // Test 4: Test de tous les filtres
    console.log('\n📋 Test 4: Test de tous les filtres disponibles');
    const response4 = await axios.get(`${BASE_URL}/api/pronto/workflow/global-results?company_filter=Google&title_filter=CEO&lead_location_filter=Paris&employee_range_filter=1000&company_location_filter=France&industry_filter=Technology&limit=3`);

    console.log('✅ Réponse reçue:');
    console.log(`   - Leads filtrés: ${response4.data.filtered_leads}`);
    console.log(`   - Tous les filtres appliqués:`);
    Object.entries(response4.data.applied_filters).forEach(([key, values]) => {
      if (values.length > 0) {
        console.log(`     * ${key}: [${values.join(', ')}]`);
      }
    });

    console.log('\n✅ Tous les tests ont réussi !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    
    if (error.response) {
      console.error(`   - Statut HTTP: ${error.response.status}`);
      console.error(`   - Données d'erreur:`, error.response.data);
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
    await testWorkflowEndpoint();
  }
}

// Exécution
main().catch(console.error);

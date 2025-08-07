const axios = require('axios');

/**
 * Script de test pour démontrer l'utilisation du sessionId LinkedIn Sales Navigator
 * Basé sur la documentation officielle LinkedIn Sales Navigator
 */

async function testSessionIdExtraction() {
  console.log('🔍 Test d\'extraction du SessionId LinkedIn Sales Navigator\n');

  try {
    // Exemple d'URL LinkedIn Sales Navigator avec sessionId
    const sampleUrl = 'https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:"Hyundai Motor Company",selectionType:INCLUDED)))))&sessionId=oyT4SvXfQXWQEbOH54crEQ%3D%3D';

    console.log('📝 URL d\'exemple:');
    console.log(sampleUrl);
    console.log('\n');

    // Test 1: Extraire le sessionId
    console.log('1. Extraction du sessionId...');
    const extractResponse = await axios.post('http://localhost:4000/api/linkedin-sales/extract-session', {
      url: sampleUrl
    });

    if (extractResponse.data.success) {
      console.log('✅ SessionId extrait:', extractResponse.data.sessionId);
      console.log('🔓 SessionId décodé:', extractResponse.data.decodedSessionId);
      console.log('📝 Message:', extractResponse.data.message);
    } else {
      console.log('❌ Erreur:', extractResponse.data.error);
    }

    console.log('\n');

    // Test 2: Générer une nouvelle URL avec le sessionId extrait
    console.log('2. Génération d\'une nouvelle URL avec le sessionId...');
    const sessionId = extractResponse.data.sessionId;
    
    const generateResponse = await axios.post('http://localhost:4000/api/linkedin-sales/generate-url-with-session', {
      searchType: 'people',
      keywords: 'développeur',
      filters: [
        {
          type: 'CURRENT_COMPANY',
          values: [
            {
              id: 'urn:li:organization:825160',
              text: 'Hyundai Motor Company',
              selectionType: 'INCLUDED'
            }
          ]
        }
      ],
      sessionId: sessionId
    });

    if (generateResponse.data.success) {
      console.log('✅ Nouvelle URL générée:');
      console.log(generateResponse.data.url);
      console.log('📝 Message:', generateResponse.data.message);
    } else {
      console.log('❌ Erreur:', generateResponse.data.error);
    }

    console.log('\n');

    // Test 3: Comparaison des URLs
    console.log('3. Comparaison des URLs:');
    console.log('🔗 URL originale:', sampleUrl);
    console.log('🆕 URL générée:', generateResponse.data.url);
    console.log('✅ Les URLs sont équivalentes:', sampleUrl === generateResponse.data.url);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

async function testSessionIdValidation() {
  console.log('\n🔍 Test de validation du SessionId\n');

  try {
    // Test avec différents formats de sessionId
    const testCases = [
      {
        name: 'SessionId valide',
        sessionId: 'oyT4SvXfQXWQEbOH54crEQ%3D%3D'
      },
      {
        name: 'SessionId décodé',
        sessionId: 'oyT4SvXfQXWQEbOH54crEQ=='
      },
      {
        name: 'SessionId court',
        sessionId: 'abc123'
      }
    ];

    for (const testCase of testCases) {
      console.log(`📝 Test: ${testCase.name}`);
      
      const response = await axios.post('http://localhost:4000/api/linkedin-sales/generate-url-with-session', {
        searchType: 'people',
        keywords: 'test',
        sessionId: testCase.sessionId
      });

      if (response.data.success) {
        console.log('✅ Succès - URL générée');
        console.log('🔗 URL:', response.data.url.substring(0, 100) + '...');
      } else {
        console.log('❌ Erreur:', response.data.error);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test de validation:', error.response?.data || error.message);
  }
}

async function demonstrateSessionIdUsage() {
  console.log('\n📚 Démonstration d\'utilisation du SessionId\n');

  console.log('🎯 Comment obtenir un SessionId LinkedIn Sales Navigator:');
  console.log('');
  console.log('1. 🌐 Connectez-vous à LinkedIn Sales Navigator');
  console.log('   URL: https://www.linkedin.com/sales/');
  console.log('');
  console.log('2. 🔍 Effectuez une recherche (prospects ou entreprises)');
  console.log('');
  console.log('3. 📋 Copiez l\'URL complète de votre navigateur');
  console.log('   Exemple: https://www.linkedin.com/sales/search/people?query=...&sessionId=oyT4SvXfQXWQEbOH54crEQ%3D%3D');
  console.log('');
  console.log('4. 🔧 Utilisez notre API pour extraire le sessionId:');
  console.log('   POST /api/linkedin-sales/extract-session');
  console.log('');
  console.log('5. 🚀 Générez de nouvelles URLs avec le sessionId:');
  console.log('   POST /api/linkedin-sales/generate-url-with-session');
  console.log('');
  console.log('💡 Avantages du SessionId:');
  console.log('   - Accès aux fonctionnalités premium de Sales Navigator');
  console.log('   - Persistance de la session utilisateur');
  console.log('   - Accès aux données enrichies');
  console.log('   - Fonctionnalités de scraping avancées');
  console.log('');
  console.log('⚠️  Important:');
  console.log('   - Le sessionId expire après un certain temps');
  console.log('   - Chaque utilisateur a son propre sessionId');
  console.log('   - Respectez les conditions d\'utilisation de LinkedIn');
}

// Exécution des tests
async function runAllTests() {
  console.log('🚀 Tests LinkedIn Sales Navigator SessionId\n');
  console.log('=' .repeat(60));
  
  await testSessionIdExtraction();
  await testSessionIdValidation();
  await demonstrateSessionIdUsage();
  
  console.log('=' .repeat(60));
  console.log('✅ Tous les tests sont terminés !');
}

// Lancer les tests si le script est exécuté directement
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testSessionIdExtraction,
  testSessionIdValidation,
  demonstrateSessionIdUsage,
  runAllTests
}; 
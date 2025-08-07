const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api/linkedin-sales';

// Fonction utilitaire pour tester les endpoints
async function testEndpoint(name, method, url, data = null) {
  try {
    console.log(`\n🧪 Test: ${name}`);
    console.log(`${method.toUpperCase()} ${url}`);
    
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
      console.log('📤 Request Body:', JSON.stringify(data, null, 2));
    }
    
    const response = await axios(config);
    console.log('✅ Status:', response.status);
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

// Tests
async function runTests() {
  console.log('🚀 Démarrage des tests de l\'API LinkedIn Sales Navigator\n');
  
  // Test 1: Obtenir les types de filtres
  await testEndpoint('Obtenir les types de filtres', 'GET', '/filter-types');
  
  // Test 2: Générer une URL simple pour les prospects
  await testEndpoint('Générer URL simple - prospects', 'POST', '/generate-url', {
    searchType: 'people',
    keywords: 'développeur'
  });
  
  // Test 3: Générer une URL simple pour les entreprises
  await testEndpoint('Générer URL simple - entreprises', 'POST', '/generate-url', {
    searchType: 'company',
    keywords: 'startup'
  });
  
  // Test 4: Générer une URL avec filtres pour les prospects
  const peopleUrlResponse = await testEndpoint('Générer URL avec filtres - prospects', 'POST', '/generate-url', {
    searchType: 'people',
    keywords: 'développeur fullstack',
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
      },
      {
        type: 'FUNCTION',
        values: [
          {
            id: 'software_engineer',
            text: 'Software Engineer',
            selectionType: 'INCLUDED'
          },
          {
            id: 'full_stack_developer',
            text: 'Full Stack Developer',
            selectionType: 'INCLUDED'
          }
        ]
      },
      {
        type: 'REGION',
        values: [
          {
            id: 'fr:75',
            text: 'Île-de-France',
            selectionType: 'INCLUDED'
          }
        ]
      }
    ]
  });
  
  // Test 5: Générer une URL avec filtres pour les entreprises
  await testEndpoint('Générer URL avec filtres - entreprises', 'POST', '/generate-url', {
    searchType: 'company',
    keywords: 'tech startup',
    filters: [
      {
        type: 'COMPANY_HEADCOUNT',
        values: [
          {
            id: 'A',
            text: '1-10',
            selectionType: 'INCLUDED'
          },
          {
            id: 'B',
            text: '11-50',
            selectionType: 'INCLUDED'
          }
        ]
      },
      {
        type: 'INDUSTRY',
        values: [
          {
            id: '4',
            text: 'Technology',
            selectionType: 'INCLUDED'
          }
        ]
      }
    ]
  });
  
  // Test 6: Valider des filtres valides
  await testEndpoint('Valider filtres valides', 'POST', '/validate-filters', {
    searchType: 'people',
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
    ]
  });
  
  // Test 7: Valider des filtres invalides
  await testEndpoint('Valider filtres invalides', 'POST', '/validate-filters', {
    searchType: 'people',
    filters: [
      {
        type: 'INVALID_FILTER_TYPE',
        values: [
          {
            id: 'test',
            text: 'Test',
            selectionType: 'INCLUDED'
          }
        ]
      }
    ]
  });
  
  // Test 8: Parser une URL générée
  if (peopleUrlResponse && peopleUrlResponse.url) {
    await testEndpoint('Parser URL générée', 'POST', '/parse-url', {
      url: peopleUrlResponse.url
    });
  }
  
  // Test 9: Parser une URL LinkedIn réelle
  await testEndpoint('Parser URL LinkedIn réelle', 'POST', '/parse-url', {
    url: 'https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:"Hyundai Motor Company",selectionType:INCLUDED)))))&keywords=développeur'
  });
  
  // Test 10: Test d'erreur - type de recherche invalide
  await testEndpoint('Test erreur - type invalide', 'POST', '/generate-url', {
    searchType: 'invalid_type',
    keywords: 'test'
  });
  
  console.log('\n🎉 Tests terminés !');
}

// Exécuter les tests
runTests().catch(console.error); 
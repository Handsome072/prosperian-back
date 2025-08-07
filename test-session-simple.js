const axios = require('axios');

/**
 * Test simple pour démontrer l'utilisation du SessionId LinkedIn Sales Navigator
 * Basé sur la documentation officielle LinkedIn Sales Navigator
 */

async function testSessionId() {
  console.log('🔐 Test SessionId LinkedIn Sales Navigator\n');

  try {
    // URL d'exemple avec sessionId
    const sampleUrl = 'https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:"Hyundai Motor Company",selectionType:INCLUDED)))))&sessionId=oyT4SvXfQXWQEbOH54crEQ%3D%3D';

    console.log('📝 URL d\'exemple:');
    console.log(sampleUrl);
    console.log('\n');

    // 1. Extraire le sessionId
    console.log('1️⃣ Extraction du sessionId...');
    const extractResponse = await axios.post('http://localhost:4000/api/linkedin-sales/extract-session', {
      url: sampleUrl
    });

    if (extractResponse.data.success) {
      console.log('✅ SessionId extrait:', extractResponse.data.sessionId);
      console.log('🔓 SessionId décodé:', extractResponse.data.decodedSessionId);
    }

    console.log('\n');

    // 2. Générer une nouvelle URL avec le sessionId
    console.log('2️⃣ Génération d\'une nouvelle URL avec sessionId...');
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
      console.log('✅ URL générée avec sessionId:');
      console.log(generateResponse.data.url);
    }

    console.log('\n');

    // 3. Test avec différents types de recherche
    console.log('3️⃣ Test avec différents types de recherche...');
    
    const searchTypes = ['people', 'company'];
    for (const searchType of searchTypes) {
      const testResponse = await axios.post('http://localhost:4000/api/linkedin-sales/generate-url-with-session', {
        searchType: searchType,
        keywords: 'test',
        sessionId: sessionId
      });

      if (testResponse.data.success) {
        console.log(`✅ ${searchType}: URL générée`);
        console.log(`🔗 ${testResponse.data.url.substring(0, 80)}...`);
      }
    }

    console.log('\n🎉 Test terminé avec succès !');
    console.log('\n📚 Documentation:');
    console.log('- Guide complet: LINKEDIN_SESSIONID_GUIDE.md');
    console.log('- API Swagger: http://localhost:4000/api-docs');
    console.log('- Interface HTML: http://localhost:4000/api/linkedin-sales');

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Lancer le test
testSessionId(); 
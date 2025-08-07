const axios = require('axios');

async function testAPI() {
  console.log('🧪 Test de l\'API LinkedIn Sales Navigator\n');
  
  try {
    // Test 1: Obtenir les types de filtres
    console.log('1. Test des types de filtres...');
    const filterTypes = await axios.get('http://localhost:4000/api/linkedin-sales/filter-types');
    console.log('✅ Types de filtres récupérés:', filterTypes.data.success);
    
    // Test 2: Générer une URL simple
    console.log('\n2. Test de génération d\'URL simple...');
    const simpleUrl = await axios.post('http://localhost:4000/api/linkedin-sales/generate-url', {
      searchType: 'people',
      keywords: 'développeur'
    });
    console.log('✅ URL générée:', simpleUrl.data.success);
    console.log('📝 URL:', simpleUrl.data.url);
    
    // Test 3: Générer une URL avec filtres
    console.log('\n3. Test de génération d\'URL avec filtres...');
    const complexUrl = await axios.post('http://localhost:4000/api/linkedin-sales/generate-url', {
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
      ]
    });
    console.log('✅ URL complexe générée:', complexUrl.data.success);
    console.log('📝 URL:', complexUrl.data.url);
    
    // Test 4: Valider des filtres
    console.log('\n4. Test de validation de filtres...');
    const validation = await axios.post('http://localhost:4000/api/linkedin-sales/validate-filters', {
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
    console.log('✅ Validation:', validation.data.valid);
    
    // Test 5: Parser une URL
    console.log('\n5. Test de parsing d\'URL...');
    const parsing = await axios.post('http://localhost:4000/api/linkedin-sales/parse-url', {
      url: 'https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:"Hyundai Motor Company",selectionType:INCLUDED)))))&keywords=développeur'
    });
    console.log('✅ Parsing réussi:', parsing.data.success);
    console.log('📝 Type de recherche:', parsing.data.searchType);
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

testAPI(); 
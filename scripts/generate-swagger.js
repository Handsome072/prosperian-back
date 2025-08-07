const fs = require('fs');
const path = require('path');

// Fonction pour extraire les commentaires Swagger d'un fichier
function extractSwaggerComments(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const swaggerComments = [];
  
  // Regex pour trouver les commentaires @swagger
  const swaggerRegex = /\/\*\*\s*\n\s*\*\s*@swagger\s*\n([\s\S]*?)\s*\*\//g;
  let match;
  
  while ((match = swaggerRegex.exec(content)) !== null) {
    swaggerComments.push(match[1]);
  }
  
  return swaggerComments;
}

// Fonction pour parser les commentaires Swagger en JSON
function parseSwaggerComments(comments) {
  const swaggerDoc = {
    openapi: '3.0.0',
    info: {
      title: 'Prosperian API',
      version: '1.0.0',
      description: 'API pour la gestion des données d\'entreprises et LinkedIn Sales Navigator'
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Serveur de développement'
      }
    ],
    paths: {},
    components: {
      schemas: {}
    },
    tags: []
  };

  comments.forEach(comment => {
    // Parser les chemins d'API
    const pathRegex = /\*\s*(\/[^:]+):/g;
    let pathMatch;
    
    while ((pathMatch = pathRegex.exec(comment)) !== null) {
      const path = pathMatch[1];
      const method = comment.match(new RegExp(`\\*\\s*${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\s*\n\s*\*\s*(\w+):`))?.[1] || 'get';
      
      if (!swaggerDoc.paths[path]) {
        swaggerDoc.paths[path] = {};
      }
      
      // Extraire les informations de base
      const summaryMatch = comment.match(/\*\s*summary:\s*(.+)/);
      const descriptionMatch = comment.match(/\*\s*description:\s*([\s\S]*?)(?=\n\s*\*|$)/);
      const tagsMatch = comment.match(/\*\s*tags:\s*\n\s*\*-\s*(.+)/);
      
      swaggerDoc.paths[path][method] = {
        summary: summaryMatch?.[1]?.trim() || '',
        description: descriptionMatch?.[1]?.trim() || '',
        tags: tagsMatch ? [tagsMatch[1].trim()] : []
      };
      
      // Ajouter le tag s'il n'existe pas
      if (tagsMatch && !swaggerDoc.tags.find(tag => tag.name === tagsMatch[1].trim())) {
        swaggerDoc.tags.push({
          name: tagsMatch[1].trim(),
          description: `API pour ${tagsMatch[1].trim()}`
        });
      }
    }
    
    // Parser les schémas
    const schemaRegex = /\*\s*components:\s*\n\s*\*\s*schemas:\s*\n([\s\S]*?)(?=\n\s*\*\/|\n\s*\*\s*\/\*\*)/g;
    let schemaMatch;
    
    while ((schemaMatch = schemaRegex.exec(comment)) !== null) {
      const schemaContent = schemaMatch[1];
      const schemaNameRegex = /\*\s*(\w+):\s*\n/g;
      let schemaNameMatch;
      
      while ((schemaNameMatch = schemaNameRegex.exec(schemaContent)) !== null) {
        const schemaName = schemaNameMatch[1];
        // Extraire le contenu du schéma (simplifié)
        const schemaStart = schemaContent.indexOf(schemaNameMatch[0]);
        const nextSchema = schemaContent.indexOf('\n * ', schemaStart + 1);
        const schemaEnd = nextSchema > 0 ? nextSchema : schemaContent.length;
        const schemaDefinition = schemaContent.substring(schemaStart, schemaEnd);
        
        // Parser basique du schéma
        const typeMatch = schemaDefinition.match(/\*\s*type:\s*(.+)/);
        const propertiesMatch = schemaDefinition.match(/\*\s*properties:\s*\n([\s\S]*?)(?=\n\s*\*|$)/);
        
        if (typeMatch) {
          swaggerDoc.components.schemas[schemaName] = {
            type: typeMatch[1].trim()
          };
          
          if (propertiesMatch) {
            swaggerDoc.components.schemas[schemaName].properties = {};
            // Parser des propriétés (simplifié)
            const properties = propertiesMatch[1];
            const propRegex = /\*\s*(\w+):\s*\n\s*\*\s*type:\s*(.+)/g;
            let propMatch;
            
            while ((propMatch = propRegex.exec(properties)) !== null) {
              swaggerDoc.components.schemas[schemaName].properties[propMatch[1]] = {
                type: propMatch[2].trim()
              };
            }
          }
        }
      }
    }
  });

  return swaggerDoc;
}

// Fonction principale
function generateSwagger() {
  const routesDir = path.join(__dirname, '../src/routes');
  const outputFile = path.join(__dirname, '../swagger.json');
  
  let allComments = [];
  
  // Lire tous les fichiers de routes
  const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));
  
  routeFiles.forEach(file => {
    const filePath = path.join(routesDir, file);
    const comments = extractSwaggerComments(filePath);
    allComments = allComments.concat(comments);
  });
  
  // Générer la documentation Swagger
  const swaggerDoc = parseSwaggerComments(allComments);
  
  // Écrire le fichier
  fs.writeFileSync(outputFile, JSON.stringify(swaggerDoc, null, 2));
  
  console.log('✅ Documentation Swagger générée avec succès !');
  console.log(`📁 Fichier créé: ${outputFile}`);
}

// Exécuter le script
if (require.main === module) {
  generateSwagger();
}

module.exports = { generateSwagger }; 
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { expressMiddleware } = require('@apollo/server/express4');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const resolvers = require('./resolvers');
require('dotenv').config();

const typeDefs = readFileSync(resolve(__dirname, './schema/schema.graphql'), 'utf8');

// Configuration du serveur Apollo
const server = new ApolloServer({ typeDefs, resolvers });

// Configuration d'Express
const app = express();

// Ajouter le middleware json pour parser le corps des requêtes
app.use(express.json());

// Appliquer le middleware GraphQL
server.start().then(() => {
  app.use('/graphql', expressMiddleware(server));
});

// Configuration de Swagger
const swaggerDocument = require('../swagger.json'); // Assurez-vous que swagger.json existe
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(`📖 Swagger UI available at http://localhost:${PORT}/api-docs`);
});
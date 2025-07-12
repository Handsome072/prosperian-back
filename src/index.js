const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { expressMiddleware } = require('@apollo/server/express4');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const resolvers = require('./resolvers');
const companyRoutes = require('./routes/company');
const establishmentRoutes = require('./routes/establishment');
const officerRoutes = require('./routes/officer');
const beneficialOwnerRoutes = require('./routes/beneficial_owner');
const financialStatementRoutes = require('./routes/financial_statement');
const riskAssessmentRoutes = require('./routes/risk_assessment');
const bodaccNoticeRoutes = require('./routes/bodacc_notice');
const legalActRoutes = require('./routes/legal_act');
const webInfoRoutes = require('./routes/web_info');
const emailRoutes = require('./routes/email');
const addressRoutes = require('./routes/address');
const userRoutes = require('./routes/user');
const fileRoutes = require('./routes/file');
const subscriptionRoutes = require('./routes/subscription');
const creditLogRoutes = require('./routes/credit_log');
const prontoRoutes = require('./routes/pronto');
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
app.use('/api/companies', companyRoutes);
app.use('/api/establishments', establishmentRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/beneficial-owners', beneficialOwnerRoutes);
app.use('/api/financial-statements', financialStatementRoutes);
app.use('/api/risk-assessments', riskAssessmentRoutes);
app.use('/api/bodacc-notices', bodaccNoticeRoutes);
app.use('/api/legal-acts', legalActRoutes);
app.use('/api/web-infos', webInfoRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/credit-logs', creditLogRoutes);
app.use('/api/pronto', prontoRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(`📖 Swagger UI available at http://localhost:${PORT}/api-docs`);
});
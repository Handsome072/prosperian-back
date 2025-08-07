require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { buildSchema } = require('graphql');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
const staticPath = path.join(__dirname, '../public');
console.log('Static files served from:', staticPath);
app.use('/public', express.static(staticPath));

const schemaPath = path.join(__dirname, 'schema', 'schema.graphql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');
const schema = buildSchema(schemaContent);

const resolvers = require('./resolvers');

const server = new ApolloServer({
  schema,
  resolvers,
  context: async ({ req }) => ({
    req
  })
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/utilisateur', require('./routes/utilisateur'));
app.use('/api/address', require('./routes/address'));
app.use('/api/beneficial_owner', require('./routes/beneficial_owner'));
app.use('/api/bodacc_notice', require('./routes/bodacc_notice'));
app.use('/api/company', require('./routes/company'));
app.use('/api/credit_log', require('./routes/credit_log'));
app.use('/api/email', require('./routes/email'));
app.use('/api/establishment', require('./routes/establishment'));
app.use('/api/file', require('./routes/file'));
app.use('/api/financial_statement', require('./routes/financial_statement'));
app.use('/api/legal_act', require('./routes/legal_act'));
app.use('/api/officer', require('./routes/officer'));
app.use('/api/risk_assessment', require('./routes/risk_assessment'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/user', require('./routes/user'));
app.use('/api/web_info', require('./routes/web_info'));
app.use('/api/list', require('./routes/list'));
app.use('/api/siren', require('./routes/siren'));
app.use('/api/siret', require('./routes/siret'));
app.use('/api/workflow', require('./routes/workflow'));
app.use('/api/prosperian', require('./routes/workflow'));
app.use('/siren-data', require('./routes/sirenData'));
app.use('/api/search', require('./routes/search'));

app.use('/api/pronto', require('./routes/pronto'));
app.use('/api/pronto-workflows', require('./routes/pronto-workflows'));
app.use('/api/pronto/workflows', require('./routes/pronto-workflows'));
app.use('/api/google-places', require('./routes/google-places'));
app.use('/api/semantic', require('./routes/semantic-search'));
app.use('/api/enrichment', require('./routes/enrichment'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/products', require('./routes/products'));
app.use('/api/subscription', require('./routes/admin-subscriptions'));
app.use('/api/credit-packs', require('./routes/admin-credit-packs'));
app.use('/api/user-subscriptions', require('./routes/admin-user-subscriptions'));
app.use('/api/linkedin-sales', require('./routes/linkedin-sales'));

app.get('/', (req, res) => {
  res.json({
    message: 'Prosperian API is running!',
    version: '1.0.0',
    endpoints: {
      graphql: '/graphql',
      swagger: '/api-docs',
      pronto: '/api/pronto',
      prontoWorkflows: '/api/pronto-workflows',
      enrichment: '/api/enrichment',
      semantic: '/api/semantic',
      googlePlaces: '/api/google-places',
      linkedinSales: '/api/linkedin-sales'
    }
  });
});

async function startServer() {
  await server.start();
  
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => ({ req })
  }));

  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`📖 Swagger UI available at http://localhost:${PORT}/api-docs`);
    console.log(`🔗 Pronto API: http://localhost:${PORT}/api/pronto`);
    console.log(`⚡ Pronto Workflows: http://localhost:${PORT}/api/pronto-workflows`);
    console.log(`💳 Payment API: http://localhost:${PORT}/api/payment`);
    console.log(`🔍 LinkedIn Sales Navigator API: http://localhost:${PORT}/api/linkedin-sales`);
  });
}

startServer().catch(console.error);
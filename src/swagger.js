const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { readFileSync } = require('fs');
const { resolve } = require('path');

const app = express();
const swaggerDocument = JSON.parse(readFileSync(resolve(__dirname, '../swagger.json'), 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(process.env.PORT || 4000, () => {
  console.log('Swagger UI available at http://localhost:4000/api-docs');
});
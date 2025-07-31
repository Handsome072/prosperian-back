if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY n\'est pas définie dans les variables d\'environnement');
  process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

console.log('✅ Configuration Stripe chargée avec succès');
console.log('Clé Stripe:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');

module.exports = stripe; 
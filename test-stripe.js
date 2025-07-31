require('dotenv').config();
const stripe = require('./src/config/stripe');

async function testStripeConnection() {
  try {
    console.log('🔍 Test de connexion Stripe...');
    console.log('Clé Stripe configurée:', process.env.STRIPE_SECRET_KEY ? 'Oui' : 'Non');
    
    // Test de récupération des produits
    console.log('\n📦 Test de récupération des produits...');
    const products = await stripe.products.list({ limit: 5 });
    console.log(`✅ ${products.data.length} produits trouvés`);
    
    if (products.data.length > 0) {
      const product = products.data[0];
      console.log(`Premier produit: ${product.name} (${product.id})`);
      
      // Test de récupération des prix
      console.log('\n💰 Test de récupération des prix...');
      const prices = await stripe.prices.list({ 
        product: product.id, 
        active: true,
        limit: 5 
      });
      console.log(`✅ ${prices.data.length} prix trouvés pour ${product.name}`);
      
      if (prices.data.length > 0) {
        const price = prices.data[0];
        console.log(`Premier prix: ${price.id} - ${price.unit_amount / 100} ${price.currency}`);
        
        // Test de création de session
        console.log('\n🛒 Test de création de session de checkout...');
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price: price.id,
              quantity: 1,
            },
          ],
          success_url: 'http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: 'http://localhost:5173/subscription',
          allow_promotion_codes: true,
          billing_address_collection: 'required',
          customer_creation: 'always',
        });
        
        console.log(`✅ Session créée avec succès: ${session.id}`);
        console.log(`URL de checkout: ${session.url}`);
      } else {
        console.log('❌ Aucun prix actif trouvé pour ce produit');
      }
    } else {
      console.log('❌ Aucun produit trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Détails:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    });
  }
}

testStripeConnection(); 
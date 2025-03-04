// routes/stripe.js
const express = require('express');
const router = express.Router();
const stripe = require('../services/stripe');

// Route pour créer une session de paiement
router.post('/pay', async (req, res) => {
  const { amount, currency } = req.body;  // montant et devise envoyés par le client

  try {
    // Créer une session de paiement (pour Stripe Checkout)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,  // USD, EUR, etc.
            product_data: {
              name: 'Recharge Virtuelle',
            },
            unit_amount: Math.max(amount * 100, 50),  // Montant en centimes (au moins 50 centimes)
        },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    res.json({ id: session.id });  // Retourne l'ID de la session de paiement
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

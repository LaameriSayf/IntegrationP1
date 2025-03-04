require('dotenv').config();  // Charge les variables d'environnement du fichier .env

const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;

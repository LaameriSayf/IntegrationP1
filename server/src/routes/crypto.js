// routes/crypto.js
const express = require('express');
const CoinGeckoService = require('../services/CoinGeckoService');
const createError = require('http-errors'); // Import de http-errors
const User = require('../models/user'); // Assurez-vous que le chemin est correct

const router = express.Router();

// CoinGecko API Endpoints
router.get('/exchange-rate/:crypto/:currency', async (req, res, next) => {
    const { crypto, currency } = req.params;
  
    if (!crypto || !currency) {
      return next(createError(400, "Invalid or missing parameters."));
    }
  
    try {
      const rate = await CoinGeckoService.getExchangeRate(crypto, currency);
      res.json({ crypto, currency, rate });
    } catch (error) {
      next(createError(500, error.message));
    }
  });
  
  router.get('/all-crypto-prices/:currency', async (req, res, next) => {
    const { currency } = req.params;
  
    if (!currency) {
      return next(createError(400, "Missing 'currency' parameter."));
    }
  
    try {
      const prices = await CoinGeckoService.getAllPrices(currency);
      res.json(prices);
    } catch (error) {
      next(createError(500, error.message));
    }
  });


// Ajouter une crypto aux préférées
router.post('/add-favorite-crypto', async (req, res, next) => {
    const { userId, crypto } = req.body; // On récupère userId et crypto du body de la requête
  
    if (!userId || !crypto) {
      return next(createError(400, "Paramètres manquants (userId ou crypto)."));
    }
  
    try {
      const message = await CoinGeckoService.addFavoriteCrypto(userId, crypto);
      res.json({ message });
    } catch (error) {
      next(createError(500, error.message));
    }
  });
  
  // Supprimer une crypto des préférées
  router.post('/remove-favorite-crypto', async (req, res, next) => {
    const { userId, crypto } = req.body; // On récupère userId et crypto du body de la requête
  
    if (!userId || !crypto) {
      return next(createError(400, "Paramètres manquants (userId ou crypto)."));
    }
  
    try {
      const message = await CoinGeckoService.removeFavoriteCrypto(userId, crypto);
      res.json({ message });
    } catch (error) {
      next(createError(500, error.message));
    }
  });
  
  // Obtenir les cryptos préférées de l'utilisateur
  router.get('/favorite-cryptos/:userId', async (req, res, next) => {
    const { userId } = req.params; // On récupère userId des paramètres de la requête
  
    if (!userId) {
      return next(createError(400, "Paramètre 'userId' manquant."));
    }
  
    try {
      const favoriteCryptos = await CoinGeckoService.getFavoriteCryptos(userId);
      res.json(favoriteCryptos);
    } catch (error) {
      next(createError(500, error.message));
    }
  });

  module.exports = router;

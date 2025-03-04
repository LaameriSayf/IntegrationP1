// controllers/ExchangeController.js
const CoinGeckoService = require('../services/CoinGeckoService');
const Transaction = require('../models/Transaction');

class ExchangeController {
  // Méthode pour récupérer le taux de change d'une crypto
  static async getExchangeRate(req, res) {
    const { crypto, currency } = req.params;

    try {
      const rate = await CoinGeckoService.getExchangeRate(crypto, currency);
      res.json({ crypto, currency, rate });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Méthode pour effectuer une conversion
  static async convert(req, res) {
    const { amount, crypto, currency, rate } = req.body;

    if (!amount || !crypto || !currency || !rate) {
      return res.status(400).json({ error: "Données invalides." });
    }

    try {
      const transaction = new Transaction(crypto, amount, rate, currency);
      res.json({
        from: crypto,
        to: currency,
        rate,
        amount,
        convertedAmount: transaction.convertedAmount,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ExchangeController;

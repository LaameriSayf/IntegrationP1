const express = require('express');
const router = express.Router();

let transactionsCollection;

const setTransactionsCollection = (collection) => {
  transactionsCollection = collection;
};

router.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await transactionsCollection.find().sort({ date: -1 }).toArray();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des transactions', error: err.message });
  }
});


module.exports = { router, setTransactionsCollection };
const FinancialTransaction = require('../models/FinancialTransaction');
const aiService = require('../services/aiService'); // Service IA
const riskCountries = require('../config/riskCountries'); // Liste des pays à risque

// Ajouter une transaction liée à un utilisateur
const addTransaction = async (req, res) => {
  try {
    const { amount, type, description, userId } = req.body;

    if (!amount || !type || !description || !userId) {
      return res.status(400).send({ error: 'Données incomplètes' });
    }

    const transaction = new FinancialTransaction({ amount, type, description, userId, date: new Date() });
    await transaction.save();

    res.status(201).send(transaction);
  } catch (error) {
    console.error("Erreur ajout transaction:", error.message);
    res.status(500).send({ error: 'Erreur ajout transaction' });
  }
};

// Prédire les transactions futures pour un utilisateur
const predictFutureTransaction = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await FinancialTransaction.find({ userId }).sort({ date: -1 }).limit(5);

    if (transactions.length < 5) {
      return res.status(400).send({ error: 'Pas assez de données pour la prédiction' });
    }

    const lastAmounts = transactions.map(t => t.amount);
    const prediction = await aiService.predict(lastAmounts);

    res.status(200).send({ predictedAmount: prediction });
  } catch (error) {
    console.error("Erreur prédiction transaction future:", error.message);
    res.status(500).send({ error: 'Erreur prédiction transaction future' });
  }
};

// Détection de fraude pour un utilisateur
const detectFraud = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await FinancialTransaction.find({ userId }).sort({ date: -1 }).limit(10);

    if (!transactions.length) {
      return res.status(404).send({ message: "Aucune transaction trouvée pour cet utilisateur." });
    }

    const FRAUD_AMOUNT_THRESHOLD = 500; 
    const HIGH_RISK_TRANSACTION_COUNT = 3; 
    const SUSPICIOUS_TIME_FRAME = 60 * 60 * 1000;

    const rapidTransactionsDetected = detectRapidTransactions(transactions, SUSPICIOUS_TIME_FRAME, HIGH_RISK_TRANSACTION_COUNT);

    const anomalies = transactions.filter(transaction => {
      return (
        transaction.amount > FRAUD_AMOUNT_THRESHOLD ||
        riskCountries.includes(transaction.country)
      );
    });

    const fraudScores = await aiService.analyze(transactions);
    const highRiskTransactions = transactions.filter((t, index) => fraudScores[index] > 0.8);

    const fraudDetected = anomalies.length > 0 || rapidTransactionsDetected || highRiskTransactions.length > 0;

    res.status(200).send({
      anomalies,
      highRiskTransactions,
      message: fraudDetected ? "Fraude potentielle détectée." : "Aucune fraude détectée.",
      fraudScore: fraudScores
    });

  } catch (error) {
    console.error("Erreur lors de la détection de fraude:", error.message);
    res.status(500).send({ error: "Erreur serveur - Échec de la détection de fraude." });
  }
};

// Détecter plusieurs transactions suspectes en peu de temps
const detectRapidTransactions = (transactions, timeFrame, maxCount) => {
  let count = 0;
  for (let i = 0; i < transactions.length - 1; i++) {
    if (new Date(transactions[i].date) - new Date(transactions[i + 1].date) < timeFrame) {
      count++;
    }
    if (count >= maxCount) return true;
  }
  return false;
};

// Recommander des actions financières pour un utilisateur
const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await FinancialTransaction.find({ userId }).sort({ date: -1 }).limit(10);

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const recommendation = totalSpent > 2000 ? 'Réduire les dépenses' : 'Bonne gestion';

    res.status(200).send({ recommendation });
  } catch (error) {
    console.error("Erreur génération recommandations:", error.message);
    res.status(500).send({ error: 'Erreur génération recommandations' });
  }
};

// Entraîner l'IA avec les données d'un utilisateur
const trainAI = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await FinancialTransaction.find({ userId });

    if (transactions.length < 5) {
      return res.status(400).send({ error: 'Pas assez de données pour entraîner l’IA' });
    }

    const data = transactions.map(t => ({
      input: [t.amount],
      output: [t.amount * 1.1]
    }));

    await aiService.trainModel(data, userId);

    res.status(200).send({ message: 'Modèle entraîné avec succès' });
  } catch (error) {
    console.error("Erreur entraînement IA:", error.message);
    res.status(500).send({ error: 'Erreur entraînement IA' });
  }
};

module.exports = {
  addTransaction,
  predictFutureTransaction,
  detectFraud,
  getRecommendations,
  trainAI
};

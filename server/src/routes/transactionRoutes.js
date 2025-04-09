const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const FinancialTransaction = require('../models/FinancialTransaction');
const aiService = require('../services/aiService');
const mongoose = require('mongoose');
const CompteBancaire = require('../models/compteBancaire');
const Transaction = require('../models/FinancialTransaction');
const requestIp = require('request-ip'); // Pour récupérer l'adresse IP
const geoip = require('geoip-lite'); // Pour la géolocalisation
const axios = require('axios');  // Pour obtenir l'IP publique si nécessaire

// Ajouter une transaction
router.post('/addTransaction/:userId/:numeroCompte', async (req, res) => {
  try {
    const { userId, numeroCompte } = req.params;
    const { amount, type, description, recipient } = req.body;

    // Validation des données
    if (!amount || !type || !description || !recipient) {
      return res.status(400).send({ error: 'Données incomplètes' });
    }

    // Vérifiez que userId est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ error: "ID utilisateur invalide" });
    }

    // Vérification de l'utilisateur expéditeur
    const sender = await User.findById(userId);
    if (!sender) {
      return res.status(404).send({ error: 'Utilisateur expéditeur non trouvé' });
    }

    // Recherche du compte source de l'expéditeur par numéro de compte
    const sourceCompte = await CompteBancaire.findOne({
      numeroCompte: numeroCompte,
      user: userId,
    });

    if (!sourceCompte) {
      return res.status(404).send({ error: 'Compte bancaire source non trouvé pour cet utilisateur' });
    }

    // Vérification du solde en cas de débit
    if (type === 'debit' && sourceCompte.balance < amount) {
      return res.status(400).send({ error: 'Solde insuffisant sur le compte source' });
    }

    // Recherche du compte destinataire avec le numéro de compte fourni
    const recipientCompte = await CompteBancaire.findOne({ numeroCompte: recipient });
    
    if (!recipientCompte) {
      return res.status(404).send({ error: 'Compte destinataire non trouvé' });
    }

    // Si le destinataire est le même que l'expéditeur, retourner une erreur
    if (recipientCompte.user.toString() === userId) {
      return res.status(400).send({ error: 'L\'expéditeur et le destinataire ne peuvent être les mêmes' });
    }

    // Récupération de l'adresse IP
    let ipAddress = requestIp.getClientIp(req);
    
    // Si l'IP est locale, on tente de récupérer l'IP publique
    if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1') {
      try {
        const response = await axios.get('https://api64.ipify.org?format=json');
        ipAddress = response.data.ip;
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'IP publique:', error.message);
        ipAddress = 'Inconnu';
      }
    }

    // Récupération de la localisation
    const geo = geoip.lookup(ipAddress);
    const location = geo
      ? `${geo.city || 'Inconnu'}, ${geo.country || 'Inconnu'}`
      : 'Inconnu';

    // Création de la transaction
    const transaction = new FinancialTransaction({
      amount,
      description,
      type,
      user: userId,  // Expéditeur
      compteBancaire: sourceCompte._id,  // ID du compte source
      recipient: recipientCompte.user,  // Utilisateur destinataire
      ipAddress,  // Adresse IP
      location,  // Localisation obtenue
      anomalie: false,
      commentaireAnomalie: '',
    });

    // Sauvegarder la transaction
    await transaction.save();

    // Mise à jour des soldes des comptes
    if (type === 'debit') {
      sourceCompte.balance -= amount;  // Débiter le compte source
      recipientCompte.balance += amount;  // Crédite le compte destinataire
    } else if (type === 'credit') {
      sourceCompte.balance += amount;  // Si crédit, ajouter au compte source
    }

    // Sauvegarder les comptes après mise à jour des soldes
    await sourceCompte.save();
    await recipientCompte.save();

    res.status(201).send({
      message: 'Transaction réussie',
      transaction,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la transaction:", error.message);
    res.status(500).send({ error: 'Erreur lors de l\'ajout de la transaction' });
  }
});

// Prédire une transaction future
router.get('/predict/:userId', transactionController.predictFutureTransaction);

// Détecter la fraude pour un utilisateur
router.get('/fraud/:userId', transactionController.detectFraud);

// Recommander des actions financières pour un utilisateur
router.get('/recommendations/:userId', transactionController.getRecommendations);

// Entraîner l'IA avec les données de l'utilisateur
router.post('/train/:userId', transactionController.trainAI);

// Ajouter une route pour récupérer les transactions d'un utilisateur
/// Récupérer toutes les transactions d'un utilisateur
router.get('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier si l'ID utilisateur est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ error: "ID utilisateur invalide." });
    }

    // Récupérer les transactions de l'utilisateur et les trier par date décroissante
    const transactions = await FinancialTransaction.find({ user: userId }).sort({ date: -1 });

    // Si aucune transaction n'est trouvée pour cet utilisateur
    if (transactions.length === 0) {
      return res.status(404).send({ message: "Aucune transaction trouvée pour cet utilisateur." });
    }

    // Si des transactions sont trouvées, on les renvoie
    res.status(200).send(transactions);
  } catch (error) {
    console.error("Erreur récupération transactions:", error.message);
    res.status(500).send({ error: "Erreur serveur - Échec de la récupération des transactions." });
  }
});
// Endpoint pour récupérer les transactions d'un utilisateur par son numéro de compte (recipient)
router.get('/api/transactions/:recipient', (req, res) => {
  const { recipient } = req.params; // Récupère le numéro du compte destinataire
  const transactions = getTransactionsByRecipient(recipient); // Fonction pour récupérer les transactions filtrées
  res.json(transactions);
});



module.exports = router;

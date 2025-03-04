const mongoose = require('mongoose');
const CompteBancaire = require('../models/compteBancaire');
const  User  = require('../models/User');

// Ajouter un compte bancaire
const addCompteBancaire = async (req, res) => {
  try {
    const { userId, balance } = req.body;
    

    // Vérification des données reçues
    if (!userId || balance === undefined) {
      return res.status(400).json({ error: 'Données incomplètes' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log('ID invalide:', userId); // Affiche l'ID qui est invalide
        return res.status(400).json({ error: "Format de l'ID invalide." });
    }
    

    // Vérification si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérification de la validité du solde (balance)
    if (isNaN(balance) || balance < 0) {
      return res.status(400).json({ error: 'Le solde doit être un nombre positif' });
    }

    // Création du compte bancaire
    const compte = new CompteBancaire({
      user: userId,
      balance: balance,
    });

    // Enregistrement du compte bancaire dans la base de données
    await compte.save();

    res.status(201).json({ message: 'Compte bancaire ajouté avec succès', compte });
  } catch (error) {
    console.error("Erreur ajout compte bancaire:", error.message);
    res.status(500).json({ error: 'Erreur interne lors de l\'ajout du compte bancaire' });
  }
};

// Récupérer tous les comptes bancaires d'un utilisateur
const getComptesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérification de la validité de l'ID de l'utilisateur
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'ID utilisateur invalide.' });
    }

    const comptes = await CompteBancaire.find({ user: userId });

    if (comptes.length === 0) {
      return res.status(404).json({ error: 'Aucun compte bancaire trouvé pour cet utilisateur' });
    }

    res.status(200).json(comptes);
  } catch (error) {
    console.error("Erreur récupération comptes bancaires:", error.message);
    res.status(500).json({ error: 'Erreur interne lors de la récupération des comptes bancaires' });
  }
};

// Récupérer un compte bancaire par son ID
const getCompteBancaire = async (req, res) => {
  const { id } = req.params;

  // Vérification de la validité de l'ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Format de l\'ID invalide.' });
  }

  try {
    const compte = await CompteBancaire.findById(id);
    if (!compte) {
      return res.status(404).json({ error: 'Compte non trouvé.' });
    }
    res.json(compte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un compte bancaire
const updateCompteBancaire = async (req, res) => {
  try {
    const { compteId } = req.params;
    const { balance } = req.body;

    // Vérification de la validité de l'ID du compte
    if (!mongoose.Types.ObjectId.isValid(compteId)) {
      return res.status(400).json({ error: 'ID du compte bancaire invalide.' });
    }

    const compte = await CompteBancaire.findById(compteId);

    if (!compte) {
      return res.status(404).json({ error: 'Compte bancaire non trouvé' });
    }

    // Mise à jour du solde
    if (balance !== undefined) {
      compte.balance = balance;
    }

    // Sauvegarder les modifications
    await compte.save();

    res.status(200).json({ message: 'Compte bancaire mis à jour avec succès', compte });
  } catch (error) {
    console.error("Erreur mise à jour compte bancaire:", error.message);
    res.status(500).json({ error: 'Erreur interne lors de la mise à jour du compte bancaire' });
  }
};

// Supprimer un compte bancaire
const deleteCompteBancaire = async (req, res) => {
  try {
    const { compteId } = req.params;

    // Vérification de la validité de l'ID du compte
    if (!mongoose.Types.ObjectId.isValid(compteId)) {
      return res.status(400).json({ error: 'ID du compte bancaire invalide.' });
    }

    const compte = await CompteBancaire.findById(compteId);

    if (!compte) {
      return res.status(404).json({ error: 'Compte bancaire non trouvé' });
    }

    await compte.remove();

    res.status(200).json({ message: 'Compte bancaire supprimé avec succès' });
  } catch (error) {
    console.error("Erreur suppression compte bancaire:", error.message);
    res.status(500).json({ error: 'Erreur interne lors de la suppression du compte bancaire' });
  }
};

// Dépôt d'argent sur un compte bancaire
const depositMoney = async (req, res) => {
  try {
    const { compteId } = req.params;
    const { amount } = req.body;

    // Vérification de la validité de l'ID du compte
    if (!mongoose.Types.ObjectId.isValid(compteId)) {
      return res.status(400).json({ error: 'ID du compte bancaire invalide.' });
    }

    const compte = await CompteBancaire.findById(compteId);

    if (!compte) {
      return res.status(404).json({ error: 'Compte bancaire non trouvé' });
    }

    compte.balance += amount;
    await compte.save();

    res.status(200).json({ message: 'Dépôt effectué avec succès', compte });
  } catch (error) {
    console.error("Erreur dépôt argent:", error.message);
    res.status(500).json({ error: 'Erreur interne lors du dépôt d\'argent' });
  }
};

// Retirer de l'argent d'un compte bancaire
const withdrawMoney = async (req, res) => {
  try {
    const { compteId } = req.params;
    const { amount } = req.body;

    // Vérification de la validité de l'ID du compte
    if (!mongoose.Types.ObjectId.isValid(compteId)) {
      return res.status(400).json({ error: 'ID du compte bancaire invalide.' });
    }

    const compte = await CompteBancaire.findById(compteId);

    if (!compte) {
      return res.status(404).json({ error: 'Compte bancaire non trouvé' });
    }

    if (compte.balance < amount) {
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    compte.balance -= amount;
    await compte.save();

    res.status(200).json({ message: 'Retrait effectué avec succès', compte });
  } catch (error) {
    console.error("Erreur retrait argent:", error.message);
    res.status(500).json({ error: 'Erreur interne lors du retrait d\'argent' });
  }
};

module.exports = {
  addCompteBancaire,
  getComptesByUserId,
  getCompteBancaire,
  updateCompteBancaire,
  deleteCompteBancaire,
  depositMoney,
  withdrawMoney,
};

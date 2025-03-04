const mongoose = require('mongoose');

// Fonction pour générer un numéro de compte bancaire unique
const generateNumeroCompte = () => {
  const bankCode = "1000"; // Code banque (exemple : Tunisie)
  const branchCode = "6035"; // Code agence
  const accountNumber = Math.floor(100000000 + Math.random() * 900000000); // 9 chiffres aléatoires
  const checksum = Math.floor(10 + Math.random() * 89); // 2 chiffres de contrôle

  return `TN59 ${bankCode} ${branchCode} ${accountNumber} ${checksum}`;
};

const compteBancaireSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  numeroCompte: { type: String, unique: true, required: true, default: generateNumeroCompte },
  balance: { type: Number, required: true, default: 0 }, // Doit être un nombre
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Avant d'enregistrer, vérifier si le numéro de compte est bien unique
compteBancaireSchema.pre('save', async function (next) {
  if (!this.numeroCompte) {
    let newNumero;
    let exists;

    do {
      newNumero = generateNumeroCompte();
      exists = await mongoose.models.CompteBancaire.findOne({ numeroCompte: newNumero });
    } while (exists);

    this.numeroCompte = newNumero;
  }

  next();
});

module.exports = mongoose.model('CompteBancaire', compteBancaireSchema, 'compteBancaire');

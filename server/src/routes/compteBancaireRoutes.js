const express = require('express');
const router = express.Router();
const compteController = require('../controllers/compteBancaireController');

// Ajouter un compte bancaire
router.post('/add', compteController.addCompteBancaire);

// Récupérer tous les comptes bancaires d'un utilisateur
router.get('/all/:userId', compteController.getComptesByUserId);

// Récupérer un compte bancaire par son ID
router.get('/getid/:id', compteController.getCompteBancaire);

// Mettre à jour un compte bancaire
router.put('/:compteId', compteController.updateCompteBancaire);

// Supprimer un compte bancaire
router.delete('/:compteId', compteController.deleteCompteBancaire);

// Dépôt d'argent sur un compte bancaire
router.post('/:compteId/deposit', compteController.depositMoney);

// Retirer de l'argent d'un compte bancaire
router.post('/:compteId/withdraw', compteController.withdrawMoney);

module.exports = router;

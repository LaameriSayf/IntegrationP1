const mongoose = require('mongoose');
const entrepriseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    creation_date: {
        type: Date,
        required: true,
    },
    adresse: {
        type: String,
        required: true,
    },
    domain: {
        type: String,
        required: true,
    },
    num_TVA: {
        type: String,
        required: true,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    
});

const Entreprise = mongoose.model('Entreprise', entrepriseSchema);

module.exports = { Entreprise };
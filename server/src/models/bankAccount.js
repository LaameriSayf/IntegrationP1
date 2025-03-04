const mongoose = require('mongoose');
const bankaccountSchema = new mongoose.Schema({
    numAccount: {
        type: Number,
        required: true,
        unique: true,
    },
    creation_Date: {
        type: Date,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        enum: ['USD', 'EUR', 'TND'],

    },
    amount: {
        type: Number,
        required: true,
    },
    Bank: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

const BankAccount = mongoose.model('BankAccount', bankaccountSchema);

module.exports = { BankAccount };
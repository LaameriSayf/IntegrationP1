// models/Transaction.js
class Transaction {
    constructor(crypto, amount, rate, currency) {
      this.crypto = crypto;
      this.amount = amount;
      this.rate = rate;
      this.currency = currency;
      this.convertedAmount = this.convertAmount();
    }
  
    // Méthode pour convertir le montant
    convertAmount() {
      return this.amount * this.rate;
    }
  }
  
  module.exports = Transaction;
  
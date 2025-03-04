import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './TransactionForm.css';

const AddTransaction = () => {
  const location = useLocation();
  const { userId, sourceAccount } = location.state || {};
  const [formData, setFormData] = useState({
    amount: '',
    type: 'debit',
    description: '',
    recipient: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!Object.values(formData).every(val => val)) {
      setError('❌ Tous les champs sont requis.');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5001/transaction/addTransaction/${userId}/${sourceAccount}`,
        { ...formData, amount: Number(formData.amount) }
      );

      setSuccessMessage('✅ Transaction réussie !');
      setFormData({
        amount: '',
        type: 'debit',
        description: '',
        recipient: ''
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(`❌ Échec de la transaction : ${errorMessage}`);
      console.error('Transaction Error:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="transaction-form-container">
      <div className="circuit-background"></div>
      <h2 className="form-title">💳 Nouvelle Transaction</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label>💰 Montant (TND) :</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="form-input"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>🔀 Type :</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-select"
          >
            <option value="debit">Débit</option>
            <option value="credit">Crédit</option>
          </select>
        </div>

        <div className="form-group">
          <label>📝 Description :</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Libellé de la transaction"
          />
        </div>

        <div className="form-group">
          <label>👤 Destinataire :</label>
          <input
            type="text"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            className="form-input"
            placeholder="N° Compte Bénéficiaire"
          />
        </div>

        <button type="submit" className="submit-button">
          🚀 Exécuter la Transaction
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;
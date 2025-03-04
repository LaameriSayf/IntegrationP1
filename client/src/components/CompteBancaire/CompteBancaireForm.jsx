import React, { useState } from "react";
import axios from "axios";

const CompteBancaireForm = ({ userId, onRefresh }) => {
  const [balance, setBalance] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/compteBancaire/add", { userId, balance: parseFloat(balance) });
      setBalance("");
      onRefresh();
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ajouter un Compte</h2>
      <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="Solde initial" required />
      <button type="submit">Ajouter</button>
    </form>
  );
};

export default CompteBancaireForm;

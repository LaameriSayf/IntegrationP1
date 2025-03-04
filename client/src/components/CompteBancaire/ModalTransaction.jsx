import React, { useState } from "react";
import axios from "axios";

const ModalTransaction = ({ compte, onClose, onRefresh }) => {
  const [amount, setAmount] = useState("");

  const handleTransaction = async (type) => {
    try {
      await axios.post(`http://localhost:5001/compteBancaire/${compte._id}/${type}`, { amount: parseFloat(amount) });
      setAmount("");
      onRefresh();
      onClose();
    } catch (error) {
      console.error(`Erreur lors du ${type} :`, error);
    }
  };

  return (
    <div className="modal">
      <h2>Transaction sur le compte {compte._id}</h2>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant" required />
      <button onClick={() => handleTransaction("depot")}>Déposer</button>
      <button onClick={() => handleTransaction("retrait")}>Retirer</button>
      <button onClick={onClose}>Fermer</button>
    </div>
  );
};

export default ModalTransaction;

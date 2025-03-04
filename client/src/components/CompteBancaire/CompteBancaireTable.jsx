import React, { useEffect, useState, useCallback } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { format } from "date-fns";
import { FaTrash, FaExchangeAlt, FaFilter, FaTable, FaWallet, FaQrcode } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import "./CompteBancaireTable.css";

const CompteBancaireTable = ({ userId, refresh, onRefresh }) => {
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompte, setSelectedCompte] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const navigate = useNavigate();

  const fetchComptes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5001/compteBancaire/all/${userId}`);
      setComptes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Erreur lors de la récupération des comptes");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchComptes();
  }, [fetchComptes, refresh]);

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce compte ?")) {
      try {
        await axios.delete(`http://localhost:5001/compteBancaire/${id}`);
        toast.success("Compte supprimé avec succès");
        onRefresh();
      } catch (error) {
        toast.error("Erreur lors de la suppression du compte");
      }
    }
  };

  const openQrModal = (compte) => {
    setSelectedCompte(compte);
    setIsQrModalOpen(true);
  };

  const handleTransactionClick = (numeroCompte) => {
    if (!numeroCompte || !userId) {
      console.error("Numéro de compte ou userId manquant");
      toast.error("Impossible d'effectuer la transaction : informations manquantes");
      return;
    }

    console.log("Redirection vers /add-transaction avec :", { userId, numeroCompte }); // Debug
    navigate("/add-transaction", {
      state: {
        sourceAccount: numeroCompte,
        userId: userId,
      },
    });
  };

  const filteredComptes = comptes.filter(
    (compte) =>
      compte.numeroCompte.toLowerCase().includes(filterText.toLowerCase()) ||
      compte.balance.toString().includes(filterText)
  );

  const columns = [
    { name: "N° Compte", selector: (row) => row.numeroCompte, sortable: true, grow: 2 },
    { name: "Solde", selector: (row) => `${row.balance} TND`, sortable: true, grow: 1 },
    { name: "Date de création", selector: (row) => format(new Date(row.createdAt), "dd/MM/yyyy"), sortable: true, grow: 1 },
    { name: "Dernière mise à jour", selector: (row) => format(new Date(row.updatedAt), "dd/MM/yyyy"), sortable: true, grow: 1 },
    {
      name: "Actions",
      cell: (row) => (
        <div className="actions">
          <button onClick={() => handleDelete(row._id)} className="delete-button">
            <FaTrash />
          </button>
          <button
            onClick={() => {
              console.log("Numéro de compte :", row.numeroCompte); // Debug
              handleTransactionClick(row.numeroCompte);
            }}
            className="transfer-button"
          >
            <FaExchangeAlt />
          </button>
        </div>
      ),
      grow: 2,
    },
  ];

  return (
    <div className="compte-bancaire-container">
      <div className="compte-bancaire-content">
        <h2 className="compte-bancaire-title">💳 Liste des Comptes Bancaires</h2>
        <div className="toolbar">
          <div className="filter-container">
            <FaFilter className="filter-icon" />
            <input
              type="text"
              placeholder="Filtrer par N° Compte ou Solde..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <button
            onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
            className="view-toggle-button"
          >
            {viewMode === "table" ? <FaWallet className="view-icon" /> : <FaTable className="view-icon" />}
            {viewMode === "table" ? "Vue Wallet" : "Vue Tableau"}
          </button>
        </div>

        {loading ? (
          <p className="loading-message">Chargement des comptes...</p>
        ) : filteredComptes.length === 0 ? (
          <p className="no-data-message">Aucun compte bancaire trouvé.</p>
        ) : viewMode === "table" ? (
          <DataTable
            columns={columns}
            data={filteredComptes}
            pagination
            highlightOnHover
            striped
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: "#4F46E5",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: "14px",
                },
              },
              rows: {
                style: {
                  backgroundColor: "#F3F4F6",
                  "&:hover": {
                    backgroundColor: "#E0E7FF",
                  },
                },
              },
            }}
          />
        ) : (
          <div className="cards-container">
            {filteredComptes.map((compte) => (
              <div key={compte._id} className={`card ${compte.balance > 1000 ? "card-solde-superieur-100" : "card-solde-inférieur-100"}`}>
                <div className="card-header">
                  <FaWallet className="wallet-icon" />
                  <h3 className="card-title">{compte.numeroCompte}</h3>
                </div>
                <p className="card-balance">Solde: {compte.balance} TND</p>
                <p className="card-date">Créé le {format(new Date(compte.createdAt), "dd/MM/yyyy")}</p>
                <p className="card-date">Mis à jour le {format(new Date(compte.updatedAt), "dd/MM/yyyy")}</p>
                <div className="card-actions">
                  <button onClick={() => handleTransactionClick(compte.numeroCompte)} className="transfer-button">
                    <FaExchangeAlt />
                  </button>
                  <button onClick={() => openQrModal(compte)} className="qr-button">
                    <FaQrcode />
                  </button>
                  <button onClick={() => handleDelete(compte._id)} className="delete-button">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isQrModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Informations du Compte</h3>
              <div className="qr-code-container">
                <QRCode value={JSON.stringify(selectedCompte)} size={200} />
              </div>
              <div className="modal-info">
                <p><strong>N° Compte:</strong> {selectedCompte.numeroCompte}</p>
                <p><strong>Solde:</strong> {selectedCompte.balance} TND</p>
              </div>
              <button onClick={() => setIsQrModalOpen(false)} className="close-button">
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default CompteBancaireTable;
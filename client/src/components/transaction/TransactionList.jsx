import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';

// Initialisation de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TransactionsTable = ({ userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [accounts, setAccounts] = useState({});
  const [view, setView] = useState('table');
  const [aiQuery, setAiQuery] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [recognition, setRecognition] = useState(null); 
  const [isListening, setIsListening] = useState(false); 

  // Fonction pour analyser la commande vocale et appliquer des filtres combinés
  const processVoiceCommand = (query) => {
    const lowerQuery = query.toLowerCase();
    const filters = {};
    let sort = {};

    // Détecter les filtres de type
    if (lowerQuery.includes('débit')) filters.type = 'debit';
    if (lowerQuery.includes('crédit')) filters.type = 'credit';
    if (lowerQuery.includes('anomalie')) filters.anomalie = true;

    // Détecter les montants
    const amountMatch = lowerQuery.match(/(supérieur|plus) à (\d+)/);
    if (amountMatch) filters.amount = { gt: parseFloat(amountMatch[2]) };

    // Détecter les dates
    const dateMatch = lowerQuery.match(/après le (\d{1,2}\/\d{1,2}\/\d{4})/);
    if (dateMatch) filters.date = { gt: new Date(dateMatch[1]) };

    // Détecter le tri
    if (lowerQuery.includes('trier par date')) {
      sort.key = 'date';
      sort.direction = lowerQuery.includes('récent') ? 'desc' : 'asc';
    }

    return { filters, sort };
  };

  // Appliquer les filtres combinés sur les transactions
  const applyFilters = ({ filters, sort }) => {
    let result = [...transactions];

    if (filters) {
      // Appliquer les filtres
      if (filters.type) result = result.filter(t => t.type === filters.type);
      if (filters.anomalie) result = result.filter(t => t.anomalie);
      if (filters.amount?.gt) result = result.filter(t => t.amount > filters.amount.gt);
      if (filters.date?.gt) result = result.filter(t => new Date(t.date) > filters.date.gt);
    }

    if (sort?.key) {
      result.sort((a, b) => {
        if (sort.key === 'date') {
          return new Date(a.date) - new Date(b.date);
        }
        return a[sort.key] - b[sort.key];
      });
      if (sort.direction === 'desc') result.reverse();
    }

    setFilteredTransactions(result);
  };

  // Démarrer la reconnaissance vocale
  const startVoiceRecognition = () => {
    const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognitionInstance.lang = 'fr-FR';
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.start();
    setRecognition(recognitionInstance);

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAiQuery(transcript);
      const { filters, sort } = processVoiceCommand(transcript);
      applyFilters({ filters, sort });
    };

    recognitionInstance.onerror = (event) => {
      console.error('Erreur de reconnaissance vocale', event.error);
    };

    setIsListening(true); 
  };

  // Arrêter la reconnaissance vocale
  const stopVoiceRecognition = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  // Charger les transactions depuis l'API
  useEffect(() => {
    axios.get(`http://localhost:5001/transaction/transactions/67bc888c89b0c925344f8703`)
      .then(response => {
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      })
      .catch(error => console.error('Erreur transactions:', error));
  }, [userId]);

  // Bascule entre le tableau et les statistiques
  const toggleView = () => {
    setView(view === 'table' ? 'stat' : 'table');
  };

  const columns = [
    { name: 'Montant', selector: row => `${row.amount} TND`, sortable: true },
    { name: 'Description', selector: row => row.description, sortable: true },
    { name: 'Type', selector: row => row.type === 'debit' ? 'Débit 💸' : 'Crédit 💰', sortable: true },
    { name: 'Date', selector: row => new Date(row.date).toLocaleDateString(), sortable: true },
    { name: 'Anomalie', selector: row => row.anomalie ? 'Oui' : 'Non', sortable: true },
    { name: 'Commentaire Anomalie', selector: row => row.commentaireAnomalie || '-', sortable: false },
    { name: 'Destinataire', selector: row => accounts[row.recipient]?.name || 'Chargement...', sortable: true },
    { name: 'Location', selector: row => row.location, sortable: true },
    { name: 'Numéro de Compte', selector: row => accounts[row.compteBancaire]?.numeroCompte || 'Chargement...', sortable: true },
  ];

  const chartData = {
    labels: transactions.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Montant des Transactions',
        data: transactions.map(t => t.amount),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Commande vocale activée (ex: 'Afficher les crédits supérieurs à 100€')"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />
          <button 
            className="btn btn-warning" 
            onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
          >
            {isListening ? 'Arrêter la reconnaissance vocale' : 'Démarrer la reconnaissance vocale'}
          </button>
        </div>
      </div>

      <button onClick={toggleView} className="btn btn-primary mb-3">
        {view === 'table' ? 'Afficher les statistiques' : 'Afficher le tableau'}
      </button>

      {view === 'table' ? (
        <DataTable
          title="Transactions de l'utilisateur"
          columns={columns}
          data={filteredTransactions}
          pagination
          highlightOnHover
          responsive
          defaultSortFieldId="date"
          defaultSortAsc={false}
        />
      ) : (
        <div>
          <h2>Statistiques des Transactions</h2>
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;

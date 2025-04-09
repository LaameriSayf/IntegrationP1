import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowUp, FaArrowDown, FaExchangeAlt } from "react-icons/fa";

const RecentTransactionsWidget = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get("http://localhost:5001/api/transactions/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API response transactions/recent:", response.data);
        const transactionsData = Array.isArray(response.data.transactions)
          ? response.data.transactions
          : [];
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching transactions:", error.response?.data || error.message);
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="widget">
      <div className="widget-header">
        <FaExchangeAlt className="icon" />
        <h4>Recent Transactions</h4>
      </div>
      {transactions.length === 0 ? (
        <p>No recent transactions to display.</p>
      ) : (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction._id}>
              <div className="transaction-item">
                <div className="icon">
                  {transaction.type === "credit" ? (
                    <FaArrowUp color="#00b894" />
                  ) : (
                    <FaArrowDown color="#d63031" />
                  )}
                </div>
                <div className="details">
                  <span className="description">{transaction.description}</span>
                  <span className={`amount ${transaction.type}`}>
                    {transaction.type === "credit" ? "+" : "-"}
                    {transaction.amount.toLocaleString()} €
                  </span>
                  <span className="date">{formatDate(transaction.date)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        .widget {
          background: linear-gradient(145deg, #ffffff, #e6e6e6);
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .widget:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .widget-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .icon {
          color: #6c5ce7;
          font-size: 1.5rem;
        }

        h4 {
          color: #2d3436;
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          margin-bottom: 10px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .transaction-item:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .description {
          flex: 1;
          color: #2d3436;
          font-weight: 500;
        }

        .amount.credit {
          color: #00b894;
          font-weight: 600;
        }

        .amount.debit {
          color: #d63031;
          font-weight: 600;
        }

        .date {
          color: #7f8c8d;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default RecentTransactionsWidget;
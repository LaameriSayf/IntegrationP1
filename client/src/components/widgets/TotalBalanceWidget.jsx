import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaWallet } from "react-icons/fa";

const TotalBalanceWidget = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get("http://localhost:5001/api/accounts/total-balance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API response total-balance:", response.data);
        setBalance(response.data.totalBalance || 0);
      } catch (error) {
        console.error("Error loading balance:", error.response?.data || error.message);
        setError("Failed to load total balance.");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (loading) return <p>Loading balance...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="widget">
      <div className="widget-header">
        <FaWallet className="icon" />
        <h4>Total Balance</h4>
      </div>
      <p className="balance">{balance.toLocaleString()} DT</p>
      <style jsx>{`
        .widget {
          background: linear-gradient(145deg, #ffffff, #e6e6e6);
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
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

        .balance {
          color: #00b894;
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default TotalBalanceWidget;
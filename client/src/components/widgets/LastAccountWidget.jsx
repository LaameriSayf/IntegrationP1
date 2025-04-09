import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUniversity } from "react-icons/fa"; // Replaced FaBank with FaUniversity

const LastAccountWidget = () => {
  const [lastAccount, setLastAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLastAccount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get("http://localhost:5001/api/accounts/last-account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API response last-account:", response.data);
        setLastAccount(response.data || {});
      } catch (error) {
        console.error("Error loading last account:", error.response?.data || error.message);
        setError("Failed to load last account.");
      } finally {
        setLoading(false);
      }
    };

    fetchLastAccount();
  }, []);

  if (loading) return <p>Loading last account...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="widget">
      <div className="widget-header">
        <FaUniversity className="icon" />
        <h4>Last Account</h4>
      </div>
      {lastAccount && lastAccount.numeroCompte ? (
        <div className="account-details">
          <p><strong>Number:</strong> {lastAccount.numeroCompte}</p>
          <p><strong>Balance:</strong> {lastAccount.balance.toLocaleString()} DT</p>
          <p><strong>Last Updated:</strong> {new Date(lastAccount.updatedAt).toLocaleDateString()}</p>
        </div>
      ) : (
        <p>No recent account</p>
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

        .account-details {
          color: #2d3436;
          font-size: 0.95rem;
        }

        .account-details p {
          margin: 5px 0;
        }

        .account-details strong {
          color: #6c5ce7;
        }
      `}</style>
    </div>
  );
};

export default LastAccountWidget;
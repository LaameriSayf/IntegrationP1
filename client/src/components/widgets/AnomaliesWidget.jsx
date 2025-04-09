import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaExclamationTriangle } from "react-icons/fa";

const AnomaliesWidget = () => {
  const [anomaliesCount, setAnomaliesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get("http://localhost:5001/api/transactions/anomalies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API response anomalies:", response.data);
        setAnomaliesCount(response.data.anomaliesCount || 0);
      } catch (error) {
        console.error("Error loading anomalies:", error.response?.data || error.message);
        setError("Failed to load anomalies.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  if (loading) return <p>Loading anomalies...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="widget">
      <div className="widget-header">
        <FaExclamationTriangle className="icon" />
        <h4>Detected Anomalies</h4>
      </div>
      <p className="count">{anomaliesCount} {anomaliesCount === 1 ? "anomaly" : "anomalies"}</p>
      <style jsx>{`
        .widget {
          background: linear-gradient(145deg, #2a5298, #1e3c72);
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          color: #fff;
          text-align: center;
        }

        .widget:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }

        .widget-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          justify-content: center;
        }

        .icon {
          color: #ff7675;
          font-size: 1.8rem;
        }

        h4 {
          font-size: 1.4rem;
          font-weight: 600;
          margin: 0;
        }

        .count {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: #ff7675;
        }
      `}</style>
    </div>
  );
};

export default AnomaliesWidget;
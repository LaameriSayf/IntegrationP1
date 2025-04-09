import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { FaChartBar } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DebitCreditChartWidget = () => {
  const [chartData, setChartData] = useState({
    labels: ["Debit", "Credit"],
    datasets: [
      {
        label: "Amount (DT)",
        data: [0, 0],
        backgroundColor: ["#ff7675", "#55efc4"],
        borderColor: ["#d63031", "#00b894"],
        borderWidth: 1,
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDebitCredit = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get("http://localhost:5001/api/transactions/debit-credit", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API response debit-credit:", response.data);
        const { debit, credit } = response.data;
        setChartData({
          labels: ["Debit", "Credit"],
          datasets: [
            {
              label: "Amount (DT)",
              data: [debit || 0, credit || 0],
              backgroundColor: ["#ff7675", "#55efc4"],
              borderColor: ["#d63031", "#00b894"],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error loading debit/credit:", error.response?.data || error.message);
        setError("Failed to load chart data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDebitCredit();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { font: { family: "'Poppins', sans-serif", size: 14 } } },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { family: "'Poppins', sans-serif", size: 12 } },
      },
      x: {
        ticks: { font: { family: "'Poppins', sans-serif", size: 12 } },
      },
    },
  };

  if (loading) return <p>Loading chart...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="widget">
      <div className="widget-header">
        <FaChartBar className="icon" />
        <h4>Debit/Credit Breakdown</h4>
      </div>
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
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

        .chart-container {
          max-height: 200px;
        }
      `}</style>
    </div>
  );
};

export default DebitCreditChartWidget;
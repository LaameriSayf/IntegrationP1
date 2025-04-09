import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axios from "axios";
import io from "socket.io-client";
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa';

const socket = io("http://localhost:5001", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

const RevenueGrowthOne = () => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [chartType, setChartType] = useState("area");
  const [dateFilter, setDateFilter] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data);
        updateTotal(res.data);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
      }
    };
    fetchData();

    socket.on("connect", () => {
      console.log("Connecté à Socket.IO, ID:", socket.id);
    });

    socket.on("initialTransactions", (initialData) => {
      console.log("Transactions initiales reçues via socket :", initialData);
      if (Array.isArray(initialData)) {
        setTransactions(initialData);
        updateTotal(initialData);
      } else {
        console.warn("Données initiales invalides reçues :", initialData);
      }
    });

    socket.on("transactionUpdate", (newData) => {
      console.log("Mise à jour reçue via socket :", newData);
      if (newData && typeof newData.amount === "number") {
        setTransactions((prev) => {
          const updated = [...prev, newData].filter(
            (item, index, self) =>
              index === self.findIndex((t) => t._id === item._id)
          );
          updateTotal(updated);
          return updated;
        });
      } else {
        console.warn("Transaction invalide reçue :", newData);
      }
    });

    socket.on("disconnect", () => {
      console.log("Déconnecté de Socket.IO");
    });

    return () => {
      socket.off("connect");
      socket.off("initialTransactions");
      socket.off("transactionUpdate");
      socket.off("disconnect");
    };
  }, []);

  const updateTotal = (data) => {
    const newTotal = data.reduce(
      (acc, curr) => acc + (curr.type === "credit" ? curr.amount : -curr.amount),
      0
    );
    setTotal(newTotal);
  };

  const filteredTransactions = dateFilter === "all"
    ? transactions
    : transactions.filter((item) => {
        const date = new Date(item.date);
        const now = new Date();
        switch (dateFilter) {
          case "last7days":
            return (now - date) <= 7 * 24 * 60 * 60 * 1000;
          case "last30days":
            return (now - date) <= 30 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      });

  const chartData = filteredTransactions.map((item) => ({
    x: new Date(item.date).getTime(),
    y: item.type === "credit" ? item.amount : -item.amount,
    type: item.type,
    amount: item.amount,
  }));

  const renderChart = () => {
    const baseOptions = {
      chart: {
        width: "100%",
        height: isExpanded ? "500px" : "250px",
        type: chartType,
        zoom: { enabled: true },
        toolbar: { show: true, tools: { download: true } },
        padding: { left: 0, right: 0, top: 0, bottom: 0 },
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "center",
        fontSize: "12px",
      },
      xaxis: {
        type: "datetime",
        labels: { format: "dd MMM HH:mm", style: { fontSize: "10px" } },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          show: true,
          formatter: (val) => `${val.toFixed(2)} €`,
          style: { fontSize: "10px" },
        },
        title: { text: "", style: { fontSize: "10px" } },
      },
      tooltip: {
        x: { format: "dd/MM/yy HH:mm" },
        y: { formatter: (val) => `${val.toFixed(2)} €` },
      },
      annotations: {
        points: chartData.map((item) => ({
          x: item.x,
          y: item.type === "credit" ? item.amount : -item.amount,
          marker: {
            size: 6,
            fillColor: item.type === "credit" ? "#00E396" : "#FF4560",
            strokeColor: "#fff",
            radius: 2,
          },
          label: {
            borderColor: item.type === "credit" ? "#00E396" : "#FF4560",
            style: {
              color: "#fff",
              background: item.type === "credit" ? "#00E396" : "#FF4560",
              fontSize: "9px",
              padding: { left: 4, right: 4, top: 2, bottom: 2 },
            },
            text: `${item.type}: ${item.amount.toFixed(2)} €`,
            offsetY: -15,
          },
        })),
      },
    };

    let specificOptions = {};
    let series = [{ name: "Cash Flow", data: chartData }];
    switch (chartType) {
      case "area":
        specificOptions = {
          stroke: { curve: "smooth", width: 2, colors: ["#487fff"] },
          fill: {
            type: "gradient",
            colors: ["#487fff"],
            gradient: {
              shade: "light",
              type: "vertical",
              shadeIntensity: 0.5,
              gradientToColors: ["#487fff00"],
              opacityFrom: 0.4,
              opacityTo: 0.1,
              stops: [0, 100],
            },
          },
          markers: { colors: ["#487fff"], strokeWidth: 2, size: 6, hover: { size: 8 } },
        };
        break;
      case "bar":
        specificOptions = {
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "50%",
              dataLabels: { position: "top", enabled: true, formatter: (val) => `${val} €` },
            },
          },
          stroke: { width: 0 },
          fill: { opacity: 1, colors: ["#487fff"] },
          dataLabels: { enabled: true, style: { fontSize: "10px" } },
        };
        series = [{ name: "Cash Flow", data: chartData.map((item) => ({ x: item.x, y: item.y })) }];
        break;
      case "line":
        specificOptions = {
          stroke: { curve: "straight", width: 2, colors: ["#487fff"] },
          markers: { colors: ["#487fff"], size: 6, hover: { size: 8 } },
        };
        break;
      case "scatter":
        specificOptions = {
          markers: {
            size: 8,
            colors: chartData.map((item) => (item.type === "credit" ? "#00E396" : "#FF4560")),
            strokeColors: "#fff",
            strokeWidth: 2,
          },
        };
        break;
      case "heatmap":
        specificOptions = {
          chart: { type: "heatmap" },
          plotOptions: {
            heatmap: {
              colorScale: {
                ranges: [{ from: -1000000, to: 0, color: "#FF4560" }, { from: 0, to: 1000000, color: "#00E396" }],
              },
            },
          },
          dataLabels: { enabled: true, style: { fontSize: "10px" } },
        };
        series = [{
          name: "Cash Flow",
          data: chartData.map((item) => ({ x: new Date(item.x).toLocaleDateString(), y: 0, value: item.y })),
        }];
        break;
      default:
        specificOptions = { chart: { type: "area" } };
    }

    return { ...baseOptions, ...specificOptions, series };
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="container-fluid" style={{ margin: 0, padding: 0 }}>
      <div
        className="card"
        style={{
          width: "100%",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease"
        }}
      >
        <div
          className="card-body"
          style={{ padding: "4px", display: "flex", flexDirection: "column" }}
        >
          <div
            className="d-flex align-items-center justify-content-between mb-1"
            style={{ gap: "4px" }}
          >
            <div>
              <h5 className="fw-bold" style={{ margin: 0, fontSize: "16px" }}>
                Cash Flow
              </h5>
              <span
                className="fw-medium text-secondary-light"
                style={{ fontSize: "12px" }}
              >
                Real-Time Report
              </span>
            </div>
            <div className="text-end">
              <h5
                className={`fw-bold ${total < 0 ? "text-danger" : "text-success"}`}
                style={{ margin: 0, fontSize: "16px" }}
              >
                {total.toFixed(2)} €
              </h5>
              <span
                className="bg-success-focus rounded-2 fw-medium text-success-main"
                style={{ padding: "2px 6px", fontSize: "12px" }}
              >
                {filteredTransactions.length > 0 &&
                filteredTransactions[filteredTransactions.length - 1] &&
                typeof filteredTransactions[filteredTransactions.length - 1].amount === "number"
                  ? `${filteredTransactions[filteredTransactions.length - 1].amount.toFixed(2)} €`
                  : "0 €"}
              </span>
            </div>
            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                style={{ padding: "2px", fontSize: "12px" }}
              >
                <option value="area">Area</option>
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="scatter">Scatter</option>
                
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: "2px", fontSize: "12px" }}
              >
                <option value="all">All Dates</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
              </select>
              <button
                onClick={toggleExpand}
                style={{
                  padding: "4px",
                  backgroundColor: "#487fff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px"
                }}
                title={isExpanded ? "Réduire" : "Agrandir"}
              >
                {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
              </button>
            </div>
          </div>
          <div
            id="revenue-chart"
            style={{ 
              height: isExpanded ? "500px" : "250px",
              transition: "height 0.3s ease"
            }}
          >
            <ReactApexChart
              options={renderChart()}
              series={renderChart().series || [{ name: "Cash Flow", data: chartData }]}
              type={chartType}
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueGrowthOne;
import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button onClick={toggleSidebar} className="toggle-btn">
        {isOpen ? "❌" : "☰"}
      </button>
      <ul>
        <li>
          <Link to="/admin-dashboard">📊 Admin Dashboard</Link>
        </li>
        <li>
          <Link to="/business-owner-dashboard">🏢 Business Owner Dashboard</Link>
        </li>
        <li>
          <Link to="/comptes-bancaires">💳 Comptes Bancaires</Link>
        </li>
        <li>
          <Link to="/crypto">💰 Crypto</Link>
        </li>
        <li>
          <Link to="/transactions">📝 Transactions</Link>
        </li>
        <li>
          <Link to="/add-transaction">➕ Ajouter Transaction</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
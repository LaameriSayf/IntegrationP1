import React from 'react';
import './App.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Back Office 🏢</div>
      <div className="navbar-links">
        <a href="#profile">👤 Profile</a>
        <a href="#notifications">🔔 Notifications</a>
        <a href="#logout">🚪 Logout</a>
      </div>
    </nav>
  );
};

export default Navbar;
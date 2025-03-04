import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/sign-in" />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" />;
  }

  return children;
};

export default PrivateRoute;

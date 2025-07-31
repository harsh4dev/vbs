import React from 'react';
import { Navigate } from 'react-router-dom';

function PublicRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user')); // Only check user

  // Redirect authenticated users to their dashboard
  if (user) {
    return <Navigate to="/booking" replace />;
  }

  return children; // Allow access to public routes if user is not logged in
}

export default PublicRoute;
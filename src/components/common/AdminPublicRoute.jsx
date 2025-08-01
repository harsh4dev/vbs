import React from 'react';
import { Navigate } from 'react-router-dom';

function AdminPublicRoute({ children }) {
  const admin = JSON.parse(localStorage.getItem('admin')); // Only check admin

  // Redirect authenticated admins to their dashboard
  if (admin) {
    return <Navigate to="/aonecafe/admin/dashboard" replace />;
  }

  return children; // Allow access to admin public routes if admin is not logged in
}

export default AdminPublicRoute;
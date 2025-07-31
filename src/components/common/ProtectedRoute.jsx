import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const admin = JSON.parse(localStorage.getItem('admin'));

  const isAdminRoute = location.pathname.startsWith('/aonecafe/admin');

  if (isAdminRoute && !admin) {
    return <Navigate to="/aonecafe/admin/login" replace />;
  }

  if (!isAdminRoute && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Unauthorized from '../error/Unauthorized';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'Admin') {
    return <Unauthorized />;
  }
  
  return children;
};

export default AdminRoute;
import React, { useContext } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { LoginContext } from './LoginContext.jsx';

const ProtectedRoutes = () => {
  const { isLoggedIn, isLoading, socketReady } = useContext(LoginContext);
  const location = useLocation();

  if (isLoading) {
    return <></>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (location.pathname == '/login') {
    return <Navigate to="/" />;
  }

  if (socketReady && !isLoading) return <Outlet />;
};

export default ProtectedRoutes;

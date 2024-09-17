import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Si aún está cargando el estado de autenticación, mostramos un loading
  if (loading) {
    return <div>Cargando...</div>; // Muestra un indicador de carga
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

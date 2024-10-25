import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Loading from '../components/common/loading/Loading.jsx';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Mostrar un loading si aún está cargando el estado de autenticación
  if (loading) {
    return <Loading />; 
  }

  // Redirigir a login si no está autenticado
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace={true} />;
};

export default PrivateRoute;
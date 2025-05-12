import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Loading from '../components/common/loading/Loading.jsx';

export default function PrivateRoute({ requiredPermission }) {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 1. Mientras determinamos el estado de autenticación, mostramos un loader
  if (loading) {
    return <Loading />;
  }

  // 2. Si no está autenticado, redirigimos al login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 3. Si se requiere un permiso específico y no lo tiene, va a /unauthorized
  if (
    requiredPermission &&
    !user.permissions?.includes(requiredPermission)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Si todo está OK, renderizamos la ruta hija
  return <Outlet />;
}
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import customFetch from './CustomFetch';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    id: localStorage.getItem('userId') || null,
    name: localStorage.getItem('userName') || null,
    roles: JSON.parse(localStorage.getItem('userRoles')) || [],
    permissions: JSON.parse(localStorage.getItem('userPermissions')) || [],
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.clear();
    setIsAuthenticated(false);
    setUser({ id: null, name: null, roles: [], permissions: [] });
    navigate('/login');
  }, [navigate]);

  // Función para obtener los permisos actualizados (envuelta en useCallback)
  const fetchUserPermissions = useCallback(async () => {
    try {
      const data = await customFetch(`/users/${user.id}`, 'GET'); // Asegúrate de que esta ruta devuelva los roles y permisos actualizados.
      const updatedRoles = data.roles.map((role) => role.name);
      const updatedPermissions = data.roles.flatMap((role) =>
        role.permissions.map((permission) => permission.name)
      );

      setUser((prevUser) => ({
        ...prevUser,
        roles: updatedRoles,
        permissions: updatedPermissions,
      }));

      // Actualizar localStorage
      localStorage.setItem('userRoles', JSON.stringify(updatedRoles));
      localStorage.setItem('userPermissions', JSON.stringify(updatedPermissions));
    } catch (error) {
      console.error('Error al actualizar los permisos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar permisos',
        text: 'Hubo un problema al actualizar los permisos. Inténtalo más tarde.',
      });
    }
  }, [user.id]);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const userId = localStorage.getItem('userId');
      if (userId) {
        setIsAuthenticated(true);
        await fetchUserPermissions(); // Actualizar permisos cuando la sesión esté activa.
      } else {
        logout();
      }
      setLoading(false);
    };

    validateToken();
  }, [token, logout, fetchUserPermissions]); // Agregar `fetchUserPermissions` como dependencia

  useEffect(() => {
    const handleTokenExpired = () => {
      logout();
      Swal.fire({
        icon: 'error',
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
      });
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, [logout]);

  const login = async (email, password) => {
    try {
      const data = await customFetch('/login', 'POST', { email, password });
      const token = data.token?.plainTextToken;
      const userData = data.user;
      console.log('Datos del usuario:', userData);

      if (token && userData) {
        const roles = userData.roles.map((role) => role.name);
        const permissions = userData.roles.flatMap((role) =>
          role.permissions.map((permission) => permission.name)
        );

        setToken(token);
        setUser({
          id: userData.id,
          name: userData.name,
          roles,
          permissions,
        });

        localStorage.setItem('token', token);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userRoles', JSON.stringify(roles));
        localStorage.setItem('userPermissions', JSON.stringify(permissions));

        setIsAuthenticated(true);
        navigate('/');
        return true;
      } else {
        throw new Error('No se recibió un token válido o datos de usuario del servidor.');
      }
    } catch (error) {
      console.error('Error en login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor.',
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, fetchUserPermissions }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

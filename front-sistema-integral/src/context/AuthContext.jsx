import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import customFetch from './CustomFetch';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Inicializamos el token y los datos del usuario desde localStorage
  const storedToken = localStorage.getItem('token') || null;
  const [token, setToken] = useState(storedToken);

  const storedUserId = localStorage.getItem('userId') || null;
  const storedUserName = localStorage.getItem('userName') || null;
  const storedUserRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  const storedUserPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
  const storedUserServices = JSON.parse(localStorage.getItem('userServices') || '[]');

  const [isAuthenticated, setIsAuthenticated] = useState(!!storedToken);
  const [user, setUser] = useState({
    id: storedUserId,
    name: storedUserName,
    roles: storedUserRoles,
    permissions: storedUserPermissions,
    services: storedUserServices,
  });

  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.clear();

    setIsAuthenticated(false);
    setUser({
      id: null,
      name: null,
      roles: [],
      permissions: [],
      services: [],
    });
    navigate('/login');
  }, [navigate]);

  /**
   * Función para obtener los roles, permisos y servicios actualizados del usuario.
   */
  const fetchUserPermissions = useCallback(async () => {
    if (!user.id) return;
    try {
      const data = await customFetch(`/users/${user.id}`, 'GET');
      const updatedRoles = data.roles.map((role) => role.name);
      const updatedPermissions = data.roles.flatMap((role) =>
        role.permissions.map((permission) => permission.name)
      );
      const updatedServices = data.servicios
        ? data.servicios.map((serv) => serv.id)
        : [];

      setUser((prevUser) => ({
        ...prevUser,
        roles: updatedRoles,
        permissions: updatedPermissions,
        services: updatedServices,
      }));

      localStorage.setItem('userRoles', JSON.stringify(updatedRoles));
      localStorage.setItem('userPermissions', JSON.stringify(updatedPermissions));
      localStorage.setItem('userServices', JSON.stringify(updatedServices));
    } catch (error) {
      console.error('Error al actualizar los permisos/servicios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar permisos',
        text: 'Hubo un problema al actualizar los permisos/servicios. Inténtalo más tarde.',
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
        await fetchUserPermissions();
      } else {
        logout();
      }
      setLoading(false);
    };

    validateToken();
  }, [token, logout, fetchUserPermissions]);

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

  /**
   * Función para hacer login.
   * Ahora solo se reciben email y password, y se almacena la sesión en localStorage.
   */
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
        let servicesArray = [];
        if (Array.isArray(userData.servicios)) {
          servicesArray = userData.servicios.map((s) => s.id);
        }

        setToken(token);
        setUser({
          id: userData.id,
          name: userData.name,
          roles,
          permissions,
          services: servicesArray,
        });

        localStorage.setItem('token', token);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userRoles', JSON.stringify(roles));
        localStorage.setItem('userPermissions', JSON.stringify(permissions));
        localStorage.setItem('userServices', JSON.stringify(servicesArray));

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
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        loading,
        fetchUserPermissions,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import customFetch from './CustomFetch';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Carga inicial desde localStorage
  const storedToken = localStorage.getItem('token');
  const storedUserId = localStorage.getItem('userId');
  const storedUserName = localStorage.getItem('userName');
  const storedUserRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  const storedUserPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
  const storedUserServices = JSON.parse(localStorage.getItem('userServices') || '[]');

  const [token, setToken] = useState(storedToken || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!storedToken);
  const [user, setUser] = useState({
    id: storedUserId,
    name: storedUserName,
    roles: storedUserRoles,
    permissions: storedUserPermissions,
    services: storedUserServices,
  });
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // LOGOUT
  const logout = useCallback(async () => {
    try {
      await customFetch('/logout', 'GET', null, false);
    } catch (error) {
      // No importa el error en logout, simplemente continuamos
    }
    setToken(null);
    setIsAuthenticated(false);
    setUser({
      id: null,
      name: null,
      roles: [],
      permissions: [],
      services: [],
    });
    localStorage.clear();
    navigate('/login');
  }, [navigate]);

  // FETCH DE PERMISOS, ROLES Y SERVICIOS
  const fetchUserPermissions = useCallback(async (showAlert = true) => {
    if (!user.id) return;
    try {
      const data = await customFetch(`/users/${user.id}`, 'GET', null, showAlert);
      const updatedRoles = data.roles?.map((role) => role.name) || [];
      const updatedPermissions = data.roles?.flatMap((role) =>
        role.permissions?.map((permission) => permission.name)
      ) || [];
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
      if (showAlert) {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar permisos',
          text: 'Hubo un problema al actualizar los permisos/servicios. Inténtalo más tarde.',
        });
      }
    }
  }, [user.id]);

  // VALIDAR TOKEN EN CADA ARRANQUE O CAMBIO
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        setInitialLoad(false);
        return;
      }
      const userId = localStorage.getItem('userId');
      if (userId) {
        setIsAuthenticated(true);
        await fetchUserPermissions(false); // Silencioso al iniciar
      } else {
        await logout();
      }
      setLoading(false);
      setInitialLoad(false);
    };
    validateToken();
    // eslint-disable-next-line
  }, [token]); // Dependencia sólo token

  // CONTROL DE CARTEL SESIÓN EXPIRADA ÚNICO
  useEffect(() => {
    const handleTokenExpired = () => {
      // Evitar múltiples alertas con un flag global
      if (window.__SESSION_EXPIRED__) return;
      window.__SESSION_EXPIRED__ = true;

      // Solo mostrar si la app ya terminó su arranque y estaba autenticada
      if (!isAuthenticated || initialLoad) return;
      logout();
      Swal.fire({
        icon: 'error',
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
      }).then(() => {
        window.__SESSION_EXPIRED__ = false;
      });
    };

    window.addEventListener('tokenExpired', handleTokenExpired);
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
      window.__SESSION_EXPIRED__ = false;
    };
    // eslint-disable-next-line
  }, [logout, isAuthenticated, initialLoad]);

  // LOGIN
  const login = async (email, password) => {
    window.__SESSION_EXPIRED__ = false; // Reseteo del flag por si acaso
    try {
      const data = await customFetch('/login', 'POST', { email, password });
      if (!data) return false;

      const token = data.token?.plainTextToken;
      const userData = data.user;

      if (token && userData) {
        const roles = userData.roles?.map((role) => role.name) || [];
        const permissions = userData.roles?.flatMap((role) =>
          role.permissions?.map((permission) => permission.name)
        ) || [];
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
        return false;
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: error.message,
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

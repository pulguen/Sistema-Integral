import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import customFetch from './CustomFetch';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Incluimos "services" en el objeto user (lo inicializamos con lo que haya en localStorage si existe)
  const [user, setUser] = useState({
    id: localStorage.getItem('userId') || null,
    name: localStorage.getItem('userName') || null,
    roles: JSON.parse(localStorage.getItem('userRoles')) || [],
    permissions: JSON.parse(localStorage.getItem('userPermissions')) || [],
    services: JSON.parse(localStorage.getItem('userServices')) || [], // <-- nuevo
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
    if (!user.id) return; // si no hay user.id, no hacemos la petición
    try {
      // Llamada a /users/{user.id} que debe devolver algo como:
      // {
      //   id: number,
      //   name: string,
      //   roles: [...],
      //   servicios: [ { id: number, nombre: string, ... }, ... ]
      //   ...
      // }
      const data = await customFetch(`/users/${user.id}`, 'GET');
      const updatedRoles = data.roles.map((role) => role.name);
      const updatedPermissions = data.roles.flatMap((role) =>
        role.permissions.map((permission) => permission.name)
      );
      // Si el backend retorna "servicios" en data.servicios, convertimos a array de IDs
      const updatedServices = data.servicios
        ? data.servicios.map((serv) => serv.id)
        : [];

      setUser((prevUser) => ({
        ...prevUser,
        roles: updatedRoles,
        permissions: updatedPermissions,
        services: updatedServices, // <-- guardamos array de IDs de servicios
      }));

      // Actualizar localStorage
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

  /**
   * Efecto que valida el token al montar (o cambiar `token`)
   */
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
        // Actualizar permisos y servicios cuando la sesión esté activa.
        await fetchUserPermissions();
      } else {
        logout();
      }
      setLoading(false);
    };

    validateToken();
  }, [token, logout, fetchUserPermissions]);

  /**
   * Efecto para manejar un token expirado (opcional)
   */
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
   * Función para hacer login
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
        // Si la respuesta del login ya incluye userData.servicios, 
        // mapeamos a IDs
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
          services: servicesArray, // <-- guardamos también
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

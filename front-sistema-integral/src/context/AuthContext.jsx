// AuthProvider.jsx
import React, { createContext, useState, useEffect } from 'react';
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
  });
  const [loading, setLoading] = useState(true);

  // Verificación inicial del token al cargar el componente
  useEffect(() => {
    // Mover fetchUserData dentro del useEffect
    const fetchUserData = async (userId) => {
      try {
        const data = await customFetch(`/users/${userId}`, 'GET');
        setUser({ id: userId, name: data.name });
        localStorage.setItem('userName', data.name);
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        setIsAuthenticated(false);
        navigate('/login');
      }
    };

    const validateToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const userId = localStorage.getItem('userId');
      if (userId) {
        await fetchUserData(userId);
        setIsAuthenticated(true);
      } else {
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        setIsAuthenticated(false);
        navigate('/login');
      }
      setLoading(false);
    };

    validateToken();
  }, [token, navigate]);

  useEffect(() => {
    const handleTokenExpired = () => {
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      setIsAuthenticated(false);
      navigate('/login');
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
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const data = await customFetch('/login', 'POST', { email, password });
      const token = data.token?.plainTextToken;
      const userId = data.token?.accessToken?.tokenable_id;

      if (token && userId) {
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        // Obtener los datos del usuario después del login
        const userData = await customFetch(`/users/${userId}`, 'GET');
        setUser({ id: userId, name: userData.name });
        localStorage.setItem('userName', userData.name);
        setIsAuthenticated(true);
        navigate('/');
        return true;
      } else {
        throw new Error('No se recibió un token válido o ID de usuario del servidor.');
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

  const logout = async () => {
    try {
      await customFetch('/logout', 'GET');
    } catch (error) {
      console.error('Error durante el logout:', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error de Cierre de Sesión',
        text: 'Hubo un problema al cerrar tu sesión. Inténtalo de nuevo.',
      });
    } finally {
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

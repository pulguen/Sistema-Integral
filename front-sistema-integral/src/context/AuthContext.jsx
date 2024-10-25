// AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [user, setUser] = useState(null);

  // Actualiza el estado cuando cambia el token
  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      localStorage.setItem('token', token);
      // Aquí puedes obtener información del usuario si es necesario
    } else {
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  // Maneja la expiración del token
  useEffect(() => {
    const handleTokenExpired = () => {
      setToken(null);
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
      const response = await fetch('http://10.0.0.17/municipalidad/public/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token?.plainTextToken;

        if (token) {
          setToken(token);
          navigate('/');
          return true;
        } else {
          throw new Error('No se recibió un token válido del servidor.');
        }
      } else if (response.status === 401) {
        Swal.fire({ icon: 'error', title: 'Datos incorrectos', text: 'El correo o la contraseña son incorrectos.' });
        return false;
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error durante el inicio de sesión.' });
        return false;
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
      return false;
    }
  };

  const logout = async () => {
    if (!token) {
      setToken(null);
      navigate('/login');
      return;
    }

    try {
      await fetch('http://10.0.0.17/municipalidad/public/api/logout', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Manejar error si es necesario
    } finally {
      setToken(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

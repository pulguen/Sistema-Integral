import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenExpired = isTokenExpired(token);
      if (tokenExpired) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
      } else {
        setIsAuthenticated(true);
        setUser({ token });
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false); // Terminamos la carga
  }, [navigate]);

  const isTokenExpired = (token) => {
    // Aquí puedes verificar si el token está expirado
    return !token;
  };

  const login = async (email, password) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos

    try {
      const response = await fetch('http://10.0.0.17/municipalidad/public/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        setUser({ token: data.token });
        navigate('/'); // Redirige a la página protegida
        return true;
      } else if (response.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Datos incorrectos',
          text: 'El correo o la contraseña son incorrectos.',
        });
        return false;
      } else if (response.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No tienes permiso para acceder a este recurso.',
        });
        return false;
      } else if (response.status >= 500) {
        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'Hubo un problema en el servidor. Intenta nuevamente más tarde.',
        });
        return false;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        Swal.fire({
          icon: 'error',
          title: 'Tiempo de espera agotado',
          text: 'El servidor tardó demasiado en responder. Intenta nuevamente más tarde.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        });
      }
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return <div>Cargando...</div>; // Indicador de carga opcional
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

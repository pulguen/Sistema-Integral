// src/context/CustomFetch.js

export class CustomError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const API_BASE_URL = process.env.REACT_APP_API_URL;

const customFetch = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, options);
    const responseText = await response.text();

    // Verifica si el backend devolvió HTML por error de configuración/redirección
    if (response.headers.get('content-type')?.includes('text/html')) {
      throw new CustomError(
        'El servidor devolvió HTML en lugar de JSON. Esto sugiere un problema de configuración en el servidor o una redirección inesperada.',
        response.status
      );
    }

    // Manejo de sesión expirada: dispara un evento para que el layout lo maneje
    if (response.status === 401 || response.status === 403) {
      if (endpoint === '/login') {
        throw new CustomError('Credenciales incorrectas', response.status);
      }
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('tokenExpired'));
      throw new CustomError('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.', response.status);
    }

    if (response.status === 422) {
      const errorData = JSON.parse(responseText);
      // Si hay errores de validación, tomá el primer mensaje
      if (errorData["error de validación"]) {
        const valObj = errorData["error de validación"];
        const firstKey = Object.keys(valObj)[0];
        const firstMsg = valObj[firstKey] && Array.isArray(valObj[firstKey]) ? valObj[firstKey][0] : JSON.stringify(valObj);
        throw new CustomError(firstMsg, response.status);
      }
      // Si hay 'message', usalo
      if (errorData.message) {
        throw new CustomError(errorData.message, response.status);
      }
      // Si no, devolvé todo el body como string
      throw new CustomError(JSON.stringify(errorData), response.status);
    }

    if (response.status === 429) {
      const msg = "Demasiadas solicitudes. Por favor, esperá unos segundos e intentá de nuevo.";
      throw new CustomError(msg, response.status);
    }

    if (!response.ok) {
      // Incluye el texto devuelto por el backend, útil para casos como “No existen recibos...”
      throw new CustomError(`Error ${response.status}: ${responseText}`, response.status);
    }

    // Respuesta vacía es aceptada como []
    if (!responseText.trim()) return [];

    return JSON.parse(responseText);
  } catch (error) {
    // NO mostrar alertas aquí: que las maneje el componente o layout
    throw error;
  }
};

export default customFetch;

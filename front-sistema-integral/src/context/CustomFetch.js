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

    if (response.headers.get('content-type')?.includes('text/html')) {
      throw new CustomError(
        'El servidor devolvió HTML en lugar de JSON. Esto sugiere un problema de configuración en el servidor o una redirección inesperada.',
        response.status
      );
    }

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
      if (errorData["error de validación"]) {
        const valObj = errorData["error de validación"];
        const firstKey = Object.keys(valObj)[0];
        const firstMsg = valObj[firstKey] && Array.isArray(valObj[firstKey]) ? valObj[firstKey][0] : JSON.stringify(valObj);
        throw new CustomError(firstMsg, response.status);
      }
      if (errorData.message) {
        throw new CustomError(errorData.message, response.status);
      }
      throw new CustomError(JSON.stringify(errorData), response.status);
    }

    if (response.status === 429) {
      const msg = "Demasiadas solicitudes. Por favor, esperá unos segundos e intentá de nuevo.";
      throw new CustomError(msg, response.status);
    }

    if (!response.ok) {
      throw new CustomError(`Error ${response.status}: ${responseText}`, response.status);
    }

    if (!responseText.trim()) return [];
    return JSON.parse(responseText);
  } catch (error) {
    throw error;
  }
};

export default customFetch;

import Swal from 'sweetalert2';

// Definir la clase CustomError
export class CustomError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const API_BASE_URL = process.env.REACT_APP_API_URL;

const customFetch = async (endpoint, method = 'GET', body = null, showAlert = true) => {
  // Se busca el token únicamente en localStorage
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

    // Si la respuesta es HTML, es posible que haya una redirección o error de configuración
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
      if (showAlert) {
        await Swal.fire({
          icon: 'error',
          title: 'Sesión expirada',
          text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
        });
      }
      return;
    }

    if (response.status === 422) {
      const errorData = JSON.parse(responseText);
      throw new CustomError(`Error 422: ${errorData.message}`, response.status);
    }
    
    if (response.status === 429) {
      const msg = "Demasiadas solicitudes. Por favor, esperá unos segundos e intentá de nuevo.";
      if (showAlert) {
        await Swal.fire({
          icon: 'warning',
          title: 'Límite de peticiones',
          text: msg,
        });
      }
      throw new CustomError(msg, response.status);
    }

    if (!response.ok) {
      if (showAlert) {
        await Swal.fire({
          icon: 'error',
          title: 'Error en la petición',
          text: `Error ${response.status}: ${response.statusText}`,
        });
      }
      throw new CustomError(`Error ${response.status}: ${responseText}`, response.status);
    }

    if (!responseText.trim()) return [];

    return JSON.parse(responseText);
  } catch (error) {
    if (showAlert) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      });
    }
    throw error;
  }
};

export default customFetch;
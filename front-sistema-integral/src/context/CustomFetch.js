// customFetch.js
import Swal from 'sweetalert2';

const customFetch = async (url, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body); // Asegúrate de convertir el cuerpo a JSON
  }

  try {
    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');

      // Despachar el evento personalizado antes de mostrar el mensaje
      window.dispatchEvent(new Event('tokenExpired'));

      await Swal.fire({
        icon: 'error',
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
      });

      return; // Detener la ejecución aquí
    }

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Error ${response.status}: ${errorMessage}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error en la petición:', error.message);

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al procesar la petición. Inténtalo de nuevo.',
    });

    throw error; // Importante lanzar el error para que pueda ser manejado por quien llama a customFetch
  }
};

export default customFetch;

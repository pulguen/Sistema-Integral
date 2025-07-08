// src/utils/getBackendErrorMsg.js

export default function getBackendErrorMsg(err, defaultMsg = 'Ocurrió un error') {
  // Si es CustomError, intentar parsear el JSON que pueda venir desde el backend
  if (err?.message?.startsWith('Error')) {
    try {
      // Quita el prefijo (ej: "Error 500: ...")
      const cleaned = err.message.replace(/^Error \d+: /, '');
      const data = JSON.parse(cleaned);
      return data?.error || data?.message || err.message;
    } catch {
      // Si no era JSON, muestra el mensaje como viene
      return err.message;
    }
  }
  // Cubre otros casos: error de red, timeout, etc
  return err?.error || err?.message || err?.toString?.() || defaultMsg;
}

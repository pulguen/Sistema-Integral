/**
 * Formatea números al formato argentino:
 * - Miles con punto y decimales con coma.
 * - Por defecto, dos decimales.
 * 
 * @param {number|string} value
 * @param {Object} options Opcional, {decimals: 2}
 * @returns {string}
 */
const formatNumber = (value, { decimals = 2 } = {}) => {
  if (value == null || isNaN(Number(value))) return '-';
  return Number(value).toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export default formatNumber;

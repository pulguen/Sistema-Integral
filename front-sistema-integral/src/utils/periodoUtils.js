// src/utils/periodoUtils.js

/**
 * A partir de un objeto periodo raw, calcula sus campos numéricos
 * (i_debito, i_descuento, i_recargo_actualizado) y total.
 */
export function normalizePeriodo(raw) {
    const d = parseFloat(raw.i_debito) || 0;
    const ds = parseFloat(raw.i_descuento) || 0;
    const r = parseFloat(raw.i_recargo_actualizado ?? raw.i_recargo ?? 0) || 0;
    return {
      ...raw,
      i_debito: d,
      i_descuento: ds,
      i_recargo_actualizado: r,
      total: d - ds + r,
    };
  }
  
  /**
   * Dada una lista de respuestas que pueden ser arrays anidados,
   * las aplana y las normaliza con normalizePeriodo.
   */
  export function flattenAndNormalizePeriodos(data) {
    let flat = [];
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (Array.isArray(item)) flat = flat.concat(item);
        else flat.push(item);
      });
    }
    return flat.map(normalizePeriodo);
  }  
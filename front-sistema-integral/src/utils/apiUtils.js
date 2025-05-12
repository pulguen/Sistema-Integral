// src/utils/apiUtils.js

/**
 * Si la respuesta viene [dataArray, status], desenpaqueta; 
 * si viene directamente un array, lo devuelve.
 */
export function unpackData(data) {
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
      return data[0];
    }
    return data;
  }
  
  /**
   * Cuando el payload de lista viene con { data, total, last_page }, devuelve sólo data
   */
  export function unwrapPaginated({ data }) {
    return Array.isArray(data) ? data : [];
  }
  
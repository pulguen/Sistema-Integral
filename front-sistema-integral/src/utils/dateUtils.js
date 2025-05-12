// src/utils/dateUtils.js

/**
 * Dada una fecha ISO (YYYY-MM-DD o con tiempo), devuelve DD/MM/YYYY
 */
export function formatDateToDMY(isoDate) {
    if (!isoDate) return "";
    const [date] = isoDate.split("T");
    const [year, month, day] = date.split("-");
    return `${day.padStart(2,"0")}/${month.padStart(2,"0")}/${year}`;
  }
  
  /**
   * Convierte YYYY-MM-DD a objeto Date local
   */
  export function parseISOToDate(isoDate) {
    if (!isoDate) return null;
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  
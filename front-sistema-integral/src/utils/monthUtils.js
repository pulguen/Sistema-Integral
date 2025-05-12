// src/utils/monthUtils.js

const MES_A_NUM = {
    Enero: 1, Febrero: 2, Marzo: 3, Abril: 4,
    Mayo: 5, Junio: 6, Julio: 7, Agosto: 8,
    Septiembre: 9, Octubre:10, Noviembre:11, Diciembre:12,
  };
  
  /** Devuelve un array de nombres para selects */
  export const MONTH_NAMES = Object.keys(MES_A_NUM);
  
  /** Convierte nombre de mes en número (1–12) */
  export function monthNameToNumber(name) {
    return MES_A_NUM[name] || 0;
  }
  
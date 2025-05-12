// src/utils/serviceUtils.js

/**
 * Dado un array de servicios y un map de tributos, devuelve
 * un objeto { [tributoId]: { tributo, services: [...] } }
 */
export function groupServicesByTributo(servicios, tributosMap) {
    return servicios.reduce((acc, svc) => {
      const tId = svc.tributo_id;
      const tributo = tributosMap[tId];
      const nombre = tributo?.nombre ?? `Tributo ${tId}`;
      if (!acc[tId]) acc[tId] = { tributo: { id: tId, nombre }, services: [] };
      acc[tId].services.push(svc);
      return acc;
    }, {});
  }
  
import React, { createContext, useState, useCallback } from 'react';
import customFetch from './CustomFetch';

export const CajaContext = createContext();

export const CajaProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detalleCierre, setDetalleCierre] = useState(null);

  const buscarRecibo = useCallback(async (busqueda) => {
    setLoading(true);
    try {
      const id = busqueda.trim();
      // Usar la nueva ruta con el parámetro en la URL
      let data = await customFetch(`/recibos/${id}`);
      console.log("Recibo obtenido:", data);
      // Si la respuesta no es un array, la envolvemos en un array
      if (!Array.isArray(data)) {
        data = [data];
      }
      setError(null);
      return data;
    } catch (err) {
      console.error("Error al buscar recibo:", err);
      setError("Error al buscar recibo.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pagarRecibo = useCallback(async (n_recibo) => {
    setLoading(true);
    try {
      console.log("Pagar recibo con número:", n_recibo);
      const payload = { recibo: Number(n_recibo) };
      const response = await customFetch("/recibos/pagar", "POST", payload);
      console.log("Respuesta de pagarRecibo:", response);
      setError(null);
      return response;
    } catch (err) {
      console.error("Error al pagar el recibo:", err);
      setError("Error al pagar el recibo.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetalleCierre = useCallback(async (id) => {
  setLoading(true);
  setError(null);
  try {
    const response = await customFetch(`/cierres/${id}`, "GET");
    setDetalleCierre(response?.data || response);
    return response?.data || response;
  } catch (err) {
    setError("Error al obtener el detalle del cierre.");
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  return (
    <CajaContext.Provider
      value={{
        buscarRecibo,
        pagarRecibo,
        fetchDetalleCierre,
        detalleCierre,
        loading,
        error
      }}
    >
      {children}
    </CajaContext.Provider>
  );
};

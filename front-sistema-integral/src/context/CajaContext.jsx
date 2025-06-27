import React, { createContext, useState, useCallback } from 'react';
import customFetch from './CustomFetch';

export const CajaContext = createContext();

export const CajaProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detalleCierre, setDetalleCierre] = useState(null);
  const [cajaCerrada, setCajaCerrada] = useState(false);

  const buscarRecibo = useCallback(async (busqueda) => {
    setLoading(true);
    try {
      const id = busqueda.trim();
      let data = await customFetch(`/recibos/${id}`);
      if (!Array.isArray(data)) {
        data = [data];
      }
      setError(null);
      return data;
    } catch (err) {
      setError("Error al buscar recibo.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pagarRecibo = useCallback(async (n_recibo) => {
    setLoading(true);
    try {
      const payload = { recibo: Number(n_recibo) };
      const response = await customFetch("/recibos/pagar", "POST", payload);
      setError(null);
      return response;
    } catch (err) {
      setError("Error al pagar el recibo.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pagarMuchosRecibos = useCallback(async (recibos) => {
    setLoading(true);
    try {
      const response = await customFetch("/recibos/pagar-muchos", "POST", { recibos });
      setError(null);
      return response;
    } catch (err) {
      setError("Error al cobrar los recibos.");
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

  // NUEVO: chequea si hay cierre de hoy
  const fetchEstadoCajaCerrada = useCallback(async () => {
    try {
      const response = await customFetch("/cierres", "GET");
      let lista = [];
      if (response && Array.isArray(response.data)) {
        lista = response.data;
      } else if (Array.isArray(response)) {
        lista = response;
      }
      const hoy = new Date().toISOString().split('T')[0];
      const cerradoHoy = lista.some(cierre => {
        // Adaptá el campo si no es f_cierre
        const fCierre = cierre.f_cierre ? cierre.f_cierre.slice(0, 10) : null;
        return fCierre === hoy;
      });
      setCajaCerrada(cerradoHoy);
      return cerradoHoy;
    } catch (e) {
      setCajaCerrada(false);
      return false;
    }
  }, []);

  return (
    <CajaContext.Provider
      value={{
        buscarRecibo,
        pagarRecibo,
        pagarMuchosRecibos,
        fetchDetalleCierre,
        detalleCierre,
        cajaCerrada,
        fetchEstadoCajaCerrada,
        loading,
        error
      }}
    >
      {children}
    </CajaContext.Provider>
  );
};

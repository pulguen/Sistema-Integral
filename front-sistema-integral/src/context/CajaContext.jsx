import React, { createContext, useState, useCallback, useEffect } from 'react';
import customFetch from './CustomFetch';
import qs from 'qs';

export const CajaContext = createContext();

export const CajaProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detalleCierre, setDetalleCierre] = useState(null);
  const [cajaCerrada, setCajaCerrada] = useState(false);

  // Limpia error si la sesión expira y se dispara tokenExpired
  useEffect(() => {
    const clearOnLogout = () => setError(null);
    window.addEventListener('tokenExpired', clearOnLogout);
    return () => window.removeEventListener('tokenExpired', clearOnLogout);
  }, []);

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
      if (err.status === 401 || err.status === 403) return;
      setError("Error al buscar recibo.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pagarRecibo = useCallback(async (recibos) => {
    setLoading(true);
    try {
      let payload;
      if (Array.isArray(recibos)) {
        payload = { recibos };
      } else {
        payload = { recibos: [Number(recibos)] };
      }
      const response = await customFetch("/recibos/pagar", "POST", payload);
      setError(null);
      return response;
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      setError("Error al cobrar el/los recibos.");
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
      if (err.status === 401 || err.status === 403) return;
      setError("Error al obtener el detalle del cierre.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
        const fCierre = cierre.f_cierre ? cierre.f_cierre.slice(0, 10) : null;
        return fCierre === hoy;
      });
      setCajaCerrada(cerradoHoy);
      return cerradoHoy;
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      setCajaCerrada(false);
      return false;
    }
  }, []);

  const fetchRecibos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    const query = qs.stringify(params, { arrayFormat: "brackets" });
    try {
      const response = await customFetch(`/recibos${query ? "?" + query : ""}`, "GET");
      return response?.data ?? response ?? [];
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      setError("Error al obtener recibos.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecibosPorFechaYCierre = useCallback(async (fechaCierre) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        f_pago_min: fechaCierre,
        f_pago_max: fechaCierre,
        condicion_pago_id: [1, 2],
      };
      const response = await fetchRecibos(params);
      const pagados = [];
      const anulados = [];
      (response || []).forEach(r => {
        if (Number(r.condicion_pago_id) === 1) pagados.push(r);
        else if (Number(r.condicion_pago_id) === 2) anulados.push(r);
      });
      return { pagados, anulados };
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      setError("Error al obtener recibos del cierre.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRecibos]);

  return (
    <CajaContext.Provider
      value={{
        buscarRecibo,
        pagarRecibo,
        fetchRecibos,
        fetchDetalleCierre,
        fetchRecibosPorFechaYCierre,
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

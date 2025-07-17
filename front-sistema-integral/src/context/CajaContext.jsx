// src/context/CajaContext.jsx
import React, { createContext, useState, useCallback, useEffect } from 'react';
import customFetch from './CustomFetch';
import qs from 'qs';

export const CajaContext = createContext();

// Adaptador universal de recibos
const CONDICIONES = {
  1: { nombre: 'Pagado', color: 'success' },
  2: { nombre: 'Anulado', color: 'danger' },
  3: { nombre: 'No pago', color: 'secondary' },
  vencido: { nombre: 'Vencido', color: 'warning' }
};

function getCondicion(recibo) {
  if (
    recibo.condicion_pago_id === 3 &&
    recibo.f_vencimiento &&
    new Date(recibo.f_vencimiento) < new Date()
  ) {
    return {
      nombre: CONDICIONES.vencido.nombre,
      color: CONDICIONES.vencido.color
    };
  }
  const cond = CONDICIONES[recibo.condicion_pago_id];
  return {
    nombre: cond?.nombre || 'Desconocido',
    color: cond?.color || 'secondary'
  };
}

function adaptarRecibos(data) {
  let arrayData = [];
  if (Array.isArray(data?.data)) {
    arrayData = data.data;
  } else if (Array.isArray(data)) {
    arrayData = data;
  } else if (data && typeof data === "object") {
    arrayData = [data];
  }
  return arrayData.map((r, i) => {
    // Cliente
    let clienteNombre = '';
    if (r.cliente && r.cliente.clientable) {
      const { nombre, apellido } = r.cliente.clientable;
      clienteNombre = [nombre, apellido].filter(Boolean).join(' ').trim();
    }
    // Cajero
    let cajeroNombre = '';
    if (r.cajero && r.cajero.name) {
      cajeroNombre = r.cajero.name;
    }
    // Condición
    const condicion = getCondicion(r);
    return {
      ...r,
      nro: i + 1,
      cliente_nombre: clienteNombre,
      cajero_nombre: cajeroNombre,
      condicion_nombre: condicion.nombre,
      condicion_color: condicion.color,
    };
  });
}

export const CajaProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recibos, setRecibos] = useState([]);
  const [detalleCierre, setDetalleCierre] = useState(null);
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [cajeros, setCajeros] = useState([]);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  const [showModal, setShowModal] = useState(false);
  const [reciboSeleccionado, setReciboSeleccionado] = useState(null);

  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    fechaDesde: '',
    fechaHasta: '',
    importeMin: '',
    importeMax: '',
    cliente: null,
    cajero: '',
  });

  // NUEVA función fetchRecibos exportada
const fetchRecibos = useCallback(async (params) => {
  try {
    const query = qs.stringify(params, { arrayFormat: "brackets" });
    const response = await customFetch(`/recibos${query ? '?' + query : ''}`, "GET");
    return adaptarRecibos(response);
  } catch (error) {
    // Devuelvo array vacío si falla (no explota el componente)
    return [];
  }
}, []);


  // Búsqueda rápida por número de recibo, siempre retorna array
  const buscarReciboRapido = useCallback(async (numeroRecibo) => {
    if (!numeroRecibo) return [];
    setLoading(true);
    try {
      let data = await customFetch(`/recibos/${numeroRecibo}`);
      // Convertir SIEMPRE a array
      const arr = adaptarRecibos(data);
      setRecibos(arr);
      setPageIndex(0);
      setError(null);
      return arr;
    } catch (err) {
      setRecibos([]);
      setError('Error al buscar recibo.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarRecibosAvanzados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filtrosAvanzados.fechaDesde) params.f_pago_min = filtrosAvanzados.fechaDesde;
      if (filtrosAvanzados.fechaHasta) params.f_pago_max = filtrosAvanzados.fechaHasta;
      if (filtrosAvanzados.importeMin)
        params.i_min = parseFloat(filtrosAvanzados.importeMin).toFixed(2);
      if (filtrosAvanzados.importeMax)
        params.i_max = parseFloat(filtrosAvanzados.importeMax).toFixed(2);
      if (filtrosAvanzados.cliente)
        params.cliente_id = [filtrosAvanzados.cliente.id];
      if (filtrosAvanzados.cajero)
        params.cajero_id = [filtrosAvanzados.cajero];
      params.condicion_pago_id = ['1'];
      const query = qs.stringify(params, { arrayFormat: "brackets" });
      let response = await customFetch(`/recibos${query ? '?' + query : ''}`, "GET");
      setRecibos(adaptarRecibos(response));
      setPageIndex(0);
    } catch (err) {
      setRecibos([]);
      setError('Error al obtener recibos.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filtrosAvanzados]);

  const limpiarFiltrosAvanzados = useCallback(() => {
    setFiltrosAvanzados({
      fechaDesde: '',
      fechaHasta: '',
      importeMin: '',
      importeMax: '',
      cliente: null,
      cajero: '',
    });
  }, []);

  const abrirModalDetalle = useCallback((recibo) => {
    setReciboSeleccionado(recibo);
    setShowModal(true);
  }, []);
  const cerrarModalDetalle = useCallback(() => {
    setReciboSeleccionado(null);
    setShowModal(false);
  }, []);

  const pagarRecibo = useCallback(async (recibos) => {
    setLoading(true);
    try {
      let payload = Array.isArray(recibos)
        ? { recibos }
        : { recibos: [Number(recibos)] };
      const response = await customFetch("/recibos/pagar", "POST", payload);
      setError(null);
      return response;
    } catch (err) {
      setError("Error al cobrar el/los recibos.");
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
    } catch (e) {
      setCajaCerrada(false);
      return false;
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

  useEffect(() => {
    let activo = true;
    customFetch('/recibos/cajeros/ids')
      .then(res => {
        const unicos = {};
        (Array.isArray(res) ? res : []).forEach(item => {
          if (item.cajero_id && !unicos[item.cajero_id]) {
            unicos[item.cajero_id] =
              item.cajero?.name || `ID ${item.cajero_id}`;
          }
        });
        const lista = Object.entries(unicos)
          .filter(([id, name]) => name && !name.startsWith('ID'))
          .map(([id, name]) => ({
            id,
            name,
          }));
        if (activo) setCajeros(lista);
      })
      .catch(() => setCajeros([]));
    return () => { activo = false };
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
      setError("Error al obtener recibos del cierre.");
      return { pagados: [], anulados: [] };
    } finally {
      setLoading(false);
    }
  }, [fetchRecibos]);

  const contextValue = {
    loading,
    error,
    recibos,
    setRecibos,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    filtrosAvanzados,
    setFiltrosAvanzados,
    buscarReciboRapido,
    buscarRecibosAvanzados,
    limpiarFiltrosAvanzados,
    showModal,
    abrirModalDetalle,
    cerrarModalDetalle,
    reciboSeleccionado,
    fetchRecibosPorFechaYCierre,
    pagarRecibo,
    fetchEstadoCajaCerrada,
    cajaCerrada,
    fetchDetalleCierre,
    detalleCierre,
    cajeros,
    fetchRecibos, // <---- exportado!
  };

  return (
    <CajaContext.Provider value={contextValue}>
      {children}
    </CajaContext.Provider>
  );
};

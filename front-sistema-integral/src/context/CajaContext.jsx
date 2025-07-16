// src/context/CajaContext.jsx
import React, { createContext, useState, useCallback, useEffect } from 'react';
import customFetch from './CustomFetch';
import qs from 'qs';

// 1. Export nombrado del contexto:
export const CajaContext = createContext();

// ------ ADAPTADOR UNIVERSAL DE RECIBOS ------
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

// 2. Provider con TODOS los estados y lógica
export const CajaProvider = ({ children }) => {
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recibos, setRecibos] = useState([]); // lista de recibos actuales
  const [detalleCierre, setDetalleCierre] = useState(null);
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [cajeros, setCajeros] = useState([]);

  // Estados de paginación local
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  // Modal de detalle
  const [showModal, setShowModal] = useState(false);
  const [reciboSeleccionado, setReciboSeleccionado] = useState(null);

  // Filtros para búsqueda avanzada
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    fechaDesde: '',
    fechaHasta: '',
    importeMin: '',
    importeMax: '',
    cliente: null,   // objeto cliente completo
    cajero: '',      // id de cajero
  });

  // ---- FUNCIONES DE BUSQUEDA ----

  // Búsqueda rápida por número de recibo
  const buscarReciboRapido = useCallback(async (numeroRecibo) => {
    if (!numeroRecibo) return;
    setLoading(true);
    try {
      let data = await customFetch(`/recibos/${numeroRecibo}`);
      setRecibos(adaptarRecibos(data));
      setPageIndex(0);
      setError(null);
    } catch (err) {
      setRecibos([]);
      setError('Error al buscar recibo.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Búsqueda avanzada
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
      params.condicion_pago_id = ['1']; // Solo pagados

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

  // Limpiar filtros avanzados
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

  // ----- MODAL DETALLE -----
  const abrirModalDetalle = useCallback((recibo) => {
    setReciboSeleccionado(recibo);
    setShowModal(true);
  }, []);
  const cerrarModalDetalle = useCallback(() => {
    setReciboSeleccionado(null);
    setShowModal(false);
  }, []);

  // Cobrar recibos (NO obligatorio acá)
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

  // Estado de la caja (cerrada o no)
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

  // Detalle de cierre
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

  // Cargar cajeros al montar (solo una vez)
  useEffect(() => {
    let activo = true;
    customFetch('/recibos/cajeros/ids')
      .then(res => {
        // Unificar cajeros por id, mostrar el name si existe, si no mostrar "Sin nombre" o el id
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


  // ----------- PROVIDER VALUE -----------
  const contextValue = {
    // Estados y setters
    loading,
    error,
    recibos,
    setRecibos,

    // paginación
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,

    // filtros avanzados
    filtrosAvanzados,
    setFiltrosAvanzados,
    buscarReciboRapido,
    buscarRecibosAvanzados,
    limpiarFiltrosAvanzados,

    // modal detalle
    showModal,
    abrirModalDetalle,
    cerrarModalDetalle,
    reciboSeleccionado,

    // otros
    pagarRecibo,
    fetchEstadoCajaCerrada,
    cajaCerrada,
    fetchDetalleCierre,
    detalleCierre,

    cajeros, // para el filtro de cajeros en búsqueda avanzada
  };

  return (
    <CajaContext.Provider value={contextValue}>
      {children}
    </CajaContext.Provider>
  );
};

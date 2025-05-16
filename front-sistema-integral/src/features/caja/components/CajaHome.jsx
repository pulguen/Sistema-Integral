import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Card, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CajaContext } from '../../../context/CajaContext.jsx';
import { AuthContext } from '../../../context/AuthContext';
import SearchRecibo from './SearchRecibo';
import ReciboResult from './ReciboResult';
import RecibosPagadosHoy from './RecibosPagadosHoy';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch';

const CajaHome = () => {
  const { buscarRecibo, pagarRecibo, loading, error } = useContext(CajaContext);
  const { user } = useContext(AuthContext);

  const hasPermission = useCallback(
    (permission) => user.permissions.includes(permission),
    [user]
  );

  const [busqueda, setBusqueda] = useState('');
  const [resultado, setResultado] = useState([]);
  const [recibosHoy, setRecibosHoy] = useState([]);
  const [busquedaManual, setBusquedaManual] = useState(false);
  const [loadingRecibosHoy, setLoadingRecibosHoy] = useState(false);
  const inputRef = useRef(null);

  // Callback para buscar un recibo
const extractReciboNumber = useCallback((codigo) => {
  return codigo.length >= 15 ? codigo.slice(12, 24) : codigo;
}, []);

const buscarReciboConChecksum = useCallback(async (codigoCompleto) => {
  try {
    const endpoint = `/recibos/${codigoCompleto}/verificar-checksum`;
    const data = await customFetch(endpoint);
    console.log("Checksum verificado:", data);
    return data;
  } catch (err) {
    console.error("Error en verificación de checksum:", err);
    throw err;
  }
}, []);

const handleBuscarRecibo = useCallback(async () => {
  if (!busqueda.trim()) {
    Swal.fire('Advertencia', 'Debe ingresar un valor para buscar.', 'warning');
    return;
  }

  try {
    let data;

    if (busquedaManual) {
      data = await buscarRecibo(busqueda);
    } else {
      await buscarReciboConChecksum(busqueda);
      const numeroRecibo = extractReciboNumber(busqueda);
      setBusqueda(numeroRecibo);
      data = await buscarRecibo(numeroRecibo);
    }

    setResultado(Array.isArray(data) ? data : [data]);
  } catch (err) {
    console.error("Error al buscar recibo:", err);
    Swal.fire('Error', 'No se pudo validar o encontrar el recibo.', 'error');
    setResultado([]);
  }
}, [busqueda, busquedaManual, buscarRecibo, buscarReciboConChecksum, extractReciboNumber]);


  // Callback para limpiar búsqueda y resultados
  const handleLimpiar = useCallback(() => {
    setBusqueda('');
    setResultado([]);
    setBusquedaManual(false);
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Callback para refrescar los recibos pagados hoy
  const fetchRecibosHoy = useCallback(async () => {
    setLoadingRecibosHoy(true);
    try {
      const fechaPago = new Date().toISOString().split("T")[0];
      const response = await customFetch(`/recibos/pagados/${fechaPago}`);
      let dataArray = [];
      if (response && response.data && Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (Array.isArray(response)) {
        dataArray = response;
      }
      setRecibosHoy(dataArray);
    } catch (err) {
      console.error("Error al obtener los recibos de hoy:", err);
    } finally {
      setLoadingRecibosHoy(false);
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    fetchRecibosHoy();
  }, [fetchRecibosHoy]);

  // Callback para cobrar un recibo
  const handleCobrarRecibo = useCallback(async (n_recibo) => {
    try {
      await pagarRecibo(n_recibo);
      Swal.fire('Cobrado!', `Recibo ${n_recibo} cobrado con éxito.`, 'success');
      // Opcional: actualizar el estado o refrescar la lista
    } catch (err) {
      console.error("Error al cobrar recibo:", err);
      Swal.fire('Error', error || 'Error al cobrar el recibo.', 'error');
    }
  }, [pagarRecibo, error]);

  const handleAnular = useCallback(async (recibo) => {
  const result = await Swal.fire({
    title: "Anular Recibo",
    text: "Ingrese el motivo de la anulación:",
    input: "text",
    inputPlaceholder: "Motivo de anulación",
    showCancelButton: true,
    confirmButtonText: "Anular",
    cancelButtonText: "Cancelar",
    preConfirm: (motivo) => {
      if (!motivo) Swal.showValidationMessage("El motivo es obligatorio");
      return motivo;
    },
  });

  if (result.isConfirmed) {
    try {
      await customFetch("/recibos/anular", "POST", {
        recibo: recibo.n_recibo,
        comentario: result.value,
      });
      setResultado(prev => prev.filter(r => r.id !== recibo.id));
      setRecibosHoy(prev => prev.filter(r => r.id !== recibo.id));
      Swal.fire("Recibo Anulado", "El recibo fue anulado correctamente.", "success");
    } catch (err) {
      console.error("Error al anular recibo:", err);
      Swal.fire("Error", "No se pudo anular el recibo.", "error");
    }
  }
}, []);

const handleQuitarRecibo = useCallback((reciboId) => {
  setResultado(prev => prev.filter(r => r.id !== reciboId));
}, []);


  return (
    <Card className="shadow-sm p-4 mt-2">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Home Caja</Breadcrumb.Item>
      </Breadcrumb>
      
      <h2 className="text-center mb-4 text-primary">Sistema de Caja</h2>
      <p className="mb-4">
        Busca un recibo leyendo el código de barra o activa la busqueda manual e ingresa el número de recibo.
      </p>
      
      <SearchRecibo
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        busquedaManual={busquedaManual}
        setBusquedaManual={setBusquedaManual}
        handleBuscarRecibo={handleBuscarRecibo}
        handleLimpiar={handleLimpiar}
        loading={loading}
        canSearch={hasPermission('recibos.show')}
        inputRef={inputRef}
      />

      <ReciboResult 
        resultado={resultado} 
        loading={loading} 
        handleCobrarRecibo={handleCobrarRecibo}
        handleAnular={handleAnular}
        handleQuitarRecibo={handleQuitarRecibo}
        hasPermission={hasPermission}
      />


      <RecibosPagadosHoy
        recibosHoy={recibosHoy}
        loadingRecibosHoy={loadingRecibosHoy}
        fetchRecibosHoy={fetchRecibosHoy}
        canViewPaid={hasPermission('recibos.index-pagados')}
      />
    </Card>
  );
};

export default CajaHome;

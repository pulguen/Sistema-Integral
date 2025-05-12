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
  const handleBuscarRecibo = useCallback(async () => {
    if (!busqueda.trim()) {
      console.warn("Debe ingresar un término de búsqueda.");
      return;
    }
    try {
      const data = await buscarRecibo(busqueda);
      setResultado(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Error al buscar recibo:", err);
    }
  }, [busqueda, buscarRecibo]);

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

  return (
    <Card className="shadow-sm p-4 mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Home Caja</Breadcrumb.Item>
      </Breadcrumb>
      
      <h2 className="text-center mb-4 text-primary">Sistema de Caja</h2>
      <p className="mb-4">
        Busca un recibo ingresando su número, descripción o medio de pago.
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

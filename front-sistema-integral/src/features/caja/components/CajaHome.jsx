import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Card, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CajaContext } from '../../../context/CajaContext.jsx';
import { AuthContext } from '../../../context/AuthContext';
import SearchRecibo from './SearchRecibo';
import ReciboResult from './ReciboResult';
import RecibosProcesadosHoy from './RecibosProcesadosHoy';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch';
import CalculadoraRecibos from './CalculadoraRecibos';

const CajaHome = () => {
  const { buscarRecibo, pagarRecibo, cajaCerrada, fetchEstadoCajaCerrada, loading, error } = useContext(CajaContext);
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

  useEffect(() => {
    fetchEstadoCajaCerrada();
  }, [fetchEstadoCajaCerrada]);

  // Acumulador de recibos para la calculadora
  const [recibosAProcesar, setRecibosAProcesar] = useState([]);

  const handleAgregarAProcesar = useCallback((nuevoRecibo) => {
    setRecibosAProcesar(prev =>
      prev.some(r => r.n_recibo === nuevoRecibo.n_recibo)
        ? prev
        : [...prev, nuevoRecibo]
    );
  }, []);

  const handleResetCalculadora = useCallback(() => {
    setRecibosAProcesar([]);
  }, []);

  const extractReciboNumber = useCallback((codigo) => {
    return codigo.length >= 15 ? codigo.slice(12, 24) : codigo;
  }, []);

  const buscarReciboConChecksum = useCallback(async (codigoCompleto) => {
    try {
      const endpoint = `/recibos/${codigoCompleto}/verificar-checksum`;
      await customFetch(endpoint);
    } catch (err) {
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
      setResultado(prev => {
        const nuevos = data.filter(n => !prev.some(r => r.id === n.id));
        return [...prev, ...nuevos];
      });
      data.forEach(recibo => {
        const estado = recibo.condicion_pago?.nombre?.toLowerCase();
        const vencimiento = new Date(recibo.f_vencimiento);
        const hoy = new Date();
        const esAnulado = estado === "anulado";
        const estaPagado = !!recibo.f_pago;
        const estaVencido = vencimiento < hoy;
        if (!esAnulado && !estaPagado && !estaVencido) {
          handleAgregarAProcesar(recibo);
        }
      });
    } catch (err) {
      Swal.fire('Error', 'No se pudo validar o encontrar el recibo.', 'error');
      setResultado([]);
    }
  }, [
    busqueda,
    busquedaManual,
    buscarRecibo,
    buscarReciboConChecksum,
    extractReciboNumber,
    handleAgregarAProcesar
  ]);

  const handleLimpiarTodo = useCallback(() => {
    setBusqueda('');
    setResultado([]);
    setBusquedaManual(false);
    handleResetCalculadora();
    if (inputRef.current) inputRef.current.focus();
  }, [handleResetCalculadora]);

  // Refrescar los recibos pagados hoy
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
    } finally {
      setLoadingRecibosHoy(false);
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    fetchRecibosHoy();
  }, [fetchRecibosHoy]);

  // Cobro individual usando SIEMPRE pagarRecibo
  const handleCobrarRecibo = useCallback(async (n_recibo) => {
    const result = await Swal.fire({
      title: "Confirmar cobro",
      text: `¿Seguro que deseas cobrar el recibo N° ${n_recibo}? Esta acción es irreversible.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cobrar",
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: 'btn btn-success mx-2',
        cancelButton: 'btn btn-secondary mx-2'
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      try {
        await pagarRecibo(n_recibo);
        Swal.fire('Cobrado!', `Recibo ${n_recibo} cobrado con éxito.`, 'success');
        setResultado(prev => prev.filter(r => r.n_recibo !== n_recibo));
        fetchRecibosHoy();
      } catch (err) {
        Swal.fire('Error', error || 'Error al cobrar el recibo.', 'error');
      }
    }
  }, [pagarRecibo, error, fetchRecibosHoy]);

  const puedenCobrarSeleccionados = recibosAProcesar.length > 0 && recibosAProcesar.every(r => {
    const estado = r.condicion_pago?.nombre?.toLowerCase();
    const vencido = new Date(r.f_vencimiento) < new Date();
    return !r.f_pago && estado !== "anulado" && !vencido;
  });

  // Cobro múltiple usando SIEMPRE pagarRecibo
  const handleCobrarSeleccionados = useCallback(async () => {
    if (recibosAProcesar.length === 0) return;
    const n_recibos = recibosAProcesar.map(r => r.n_recibo);

    const result = await Swal.fire({
      title: n_recibos.length > 1 ? "¿Cobrar todos los recibos?" : "¿Cobrar este recibo?",
      text: n_recibos.length > 1
        ? `Se cobrarán ${n_recibos.length} recibos. ¿Desea continuar?`
        : `Se cobrará el recibo N° ${n_recibos[0]}. ¿Desea continuar?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cobrar",
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: 'btn btn-success mx-2',
        cancelButton: 'btn btn-secondary mx-2'
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;

    try {
      await pagarRecibo(n_recibos);
      Swal.fire("¡Cobro realizado!", "Se cobraron los recibos seleccionados.", "success");
      handleResetCalculadora();
      fetchRecibosHoy();
      setResultado([]);
    } catch (err) {
      Swal.fire("Error", error || "No se pudieron cobrar los recibos seleccionados.", "error");
    }
  }, [recibosAProcesar, pagarRecibo, handleResetCalculadora, fetchRecibosHoy, setResultado, error]);

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
        fetchRecibosHoy();
        Swal.fire("Recibo Anulado", "El recibo fue anulado correctamente.", "success");
      } catch (err) {
        Swal.fire("Error", "No se pudo anular el recibo.", "error");
      }
    }
  }, [fetchRecibosHoy]);

  const handleQuitarRecibo = useCallback((reciboId) => {
    setResultado(prev => prev.filter(r => r.id !== reciboId));
    setRecibosAProcesar(prev => prev.filter(r => r.id !== reciboId));
  }, []);

  const handleRemoveReciboDeCalculadora = useCallback((id) => {
    setRecibosAProcesar(prev => prev.filter(r => r.id !== id));
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
      <h5 className="text-center mb-4 text-primary">
        Busca un recibo leyendo el código de barra o activa la búsqueda manual e ingresa el número de recibo.
      </h5>

      {cajaCerrada && (
        <div className="alert alert-info text-center my-3">
          <b>La caja de hoy ya fue cerrada. No se pueden realizar más cobros hasta mañana.</b>
        </div>
      )}

      <div className="d-flex flex-column flex-md-row gap-4 mb-4 w-100">
        <div className="flex-fill" style={{ minWidth: 320 }}>
          <SearchRecibo
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            busquedaManual={busquedaManual}
            setBusquedaManual={setBusquedaManual}
            handleBuscarRecibo={handleBuscarRecibo}
            handleLimpiar={handleLimpiarTodo}
            loading={loading}
            canSearch={hasPermission('recibos.show')}
            inputRef={inputRef}
            onCobrarSeleccionados={handleCobrarSeleccionados}
            puedenCobrarSeleccionados={puedenCobrarSeleccionados}
            cantidadRecibos={recibosAProcesar.length}
            cajaCerrada={cajaCerrada}
          />
        </div>
        <div className="flex-fill mx-auto" style={{ minWidth: 320, maxWidth: 740 }}>
          <CalculadoraRecibos
            recibos={recibosAProcesar}
            onReset={handleResetCalculadora}
            onRemoveRecibo={handleRemoveReciboDeCalculadora}
          />
        </div>
      </div>

      <ReciboResult
        resultado={resultado}
        loading={loading}
        handleCobrarRecibo={handleCobrarRecibo}
        handleAnular={handleAnular}
        handleQuitarRecibo={handleQuitarRecibo}
        hasPermission={hasPermission}
        cajaCerrada={cajaCerrada}
      />

      <RecibosProcesadosHoy
        recibosHoy={recibosHoy}
        loadingRecibosHoy={loadingRecibosHoy}
        fetchRecibosHoy={fetchRecibosHoy}
        canViewPaid={hasPermission('recibos.index-pagados')}
      />
    </Card>
  );
};

export default CajaHome;

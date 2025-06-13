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

  // Acumulador de recibos para la calculadora
  const [recibosAProcesar, setRecibosAProcesar] = useState([]);

  // Agregar recibo a la calculadora (evitar duplicados)
  const handleAgregarAProcesar = useCallback((nuevoRecibo) => {
    setRecibosAProcesar(prev =>
      prev.some(r => r.n_recibo === nuevoRecibo.n_recibo)
        ? prev
        : [...prev, nuevoRecibo]
    );
  }, []);  

  // Volver a cero la calculadora
  const handleResetCalculadora = useCallback(() => {
    setRecibosAProcesar([]);
  }, []);

  // Extraer número de recibo (según código)
  const extractReciboNumber = useCallback((codigo) => {
    return codigo.length >= 15 ? codigo.slice(12, 24) : codigo;
  }, []);

  // Verificación con checksum
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

  // Buscar un recibo y agregar a la calculadora si corresponde
const handleBuscarRecibo = useCallback(async () => {
  if (!busqueda.trim()) {
    Swal.fire('Advertencia', 'Debe ingresar un valor para buscar.', 'warning');
    return;
  }

  try {
    let data;

    if (busquedaManual) {
      data = await buscarRecibo(busqueda); // SIEMPRE array
    } else {
      await buscarReciboConChecksum(busqueda);
      const numeroRecibo = extractReciboNumber(busqueda);
      setBusqueda(numeroRecibo);
      data = await buscarRecibo(numeroRecibo); // SIEMPRE array
    }

    setResultado(prev => {
      const nuevos = data.filter(n => !prev.some(r => r.id === n.id));
      return [...prev, ...nuevos];
    });


    // Sumar recibos válidos a la calculadora (no pagados ni anulados ni vendidos)
data.forEach(recibo => {
  const estado = recibo.condicion_pago?.nombre?.toLowerCase();
  const vencimiento = new Date(recibo.f_vencimiento);
  const hoy = new Date();
  const esAnulado = estado === "anulado";
  const estaPagado = !!recibo.f_pago;
  const estaVencido = vencimiento < hoy;

  // SOLO SE AGREGAN LOS QUE SE PUEDEN COBRAR
  if (!esAnulado && !estaPagado && !estaVencido) {
    handleAgregarAProcesar(recibo);
  }
});


  } catch (err) {
    console.error("Error al buscar recibo:", err);
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


  // Limpiar campo de búsqueda y resultado
  const handleLimpiar = useCallback(() => {
    setBusqueda('');
    setResultado([]);
    setBusquedaManual(false);
    if (inputRef.current) inputRef.current.focus();
  }, []);

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
      console.error("Error al obtener los recibos de hoy:", err);
    } finally {
      setLoadingRecibosHoy(false);
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    fetchRecibosHoy();
  }, [fetchRecibosHoy]);

  // Cobrar un recibo
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
        fetchRecibosHoy(); // <---- REFRESCA automátic.
      } catch (err) {
        console.error("Error al cobrar recibo:", err);
        Swal.fire('Error', error || 'Error al cobrar el recibo.', 'error');
      }
    }
  }, [pagarRecibo, error, fetchRecibosHoy]);

  // Anular recibo
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
        fetchRecibosHoy(); // <---- REFRESCA automátic.
        Swal.fire("Recibo Anulado", "El recibo fue anulado correctamente.", "success");
      } catch (err) {
        console.error("Error al anular recibo:", err);
        Swal.fire("Error", "No se pudo anular el recibo.", "error");
      }
    }
  }, [fetchRecibosHoy]);

  // Quitar un recibo del resultado (no de la calculadora)
  const handleQuitarRecibo = useCallback((reciboId) => {
    setResultado(prev => prev.filter(r => r.id !== reciboId));
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
      <p className="mb-4">
        Busca un recibo leyendo el código de barra o activa la busqueda manual e ingresa el número de recibo.
      </p>

      {/* Buscador y calculadora lado a lado */}
      <div className="d-flex flex-column flex-md-row gap-4 mb-4 w-100">
        <div className="flex-fill" style={{ minWidth: 320 }}>
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

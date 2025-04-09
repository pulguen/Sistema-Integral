import React, { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import { Card, Form, Breadcrumb, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CajaContext } from '../../../context/CajaContext.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { FaSearch, FaMoneyCheckAlt, FaTrashAlt, FaSyncAlt, FaEraser, FaBan } from 'react-icons/fa';
import customFetch from '../../../context/CustomFetch';
import '../../../styles/CajaHome.css';
// Import the common table component
import CommonTable from '../../../components/common/table/table.jsx';
// Import the AuthContext to check permissions
import { AuthContext } from '../../../context/AuthContext';

const CajaHome = () => {
  const { buscarRecibo, pagarRecibo, loading, error } = useContext(CajaContext);
  const { user } = useContext(AuthContext);

  // Wrap hasPermission in useCallback to keep its reference stable
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

  // Extract the receipt number from the complete code
  const extractReciboNumber = useCallback((codigo) => {
    return codigo.length >= 15 ? codigo.slice(12, 24) : codigo;
  }, []);

  // Verify checksum using the API
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

  // Fetch today's paid receipts using the new route
  const fetchRecibosHoy = useCallback(async () => {
    setLoadingRecibosHoy(true);
    try {
      const fechaPago = new Date().toISOString().split("T")[0];
      console.log("Fecha para consulta de recibos pagados:", fechaPago);

      const response = await customFetch(`/recibos/pagados/${fechaPago}`);
      console.log("Respuesta de /recibos/pagados/{fechaPago}:", response);

      let dataArray = [];
      if (response && response.data && Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (Array.isArray(response)) {
        dataArray = response;
      }
      console.log("Array de recibos pagados hoy:", dataArray);
      setRecibosHoy(dataArray);
    } catch (err) {
      console.error("Error obteniendo recibos pagados hoy:", err);
    } finally {
      setLoadingRecibosHoy(false);
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    fetchRecibosHoy();
  }, [fetchRecibosHoy]);

  // Function to search for a receipt (manual or by checksum)
  const handleBuscarRecibo = useCallback(async () => {
    if (busquedaManual) {
      try {
        let data = await buscarRecibo(busqueda);
        console.log("Recibo encontrado (manual):", data);
        if (!Array.isArray(data)) {
          data = data ? [data] : [];
        }
        if (data.length === 0) {
          Swal.fire('Advertencia', 'No se encontró el número de recibo', 'warning');
        }
        setResultado(data);
      } catch (err) {
        console.error("Error buscando recibo manual:", err);
        Swal.fire('Error', 'Hubo un error al buscar el recibo manual', 'error');
        setResultado([]);
      }
    } else {
      try {
        await buscarReciboConChecksum(busqueda);
        const numeroRecibo = extractReciboNumber(busqueda);
        console.log("Número extraído:", numeroRecibo);
        setBusqueda(numeroRecibo);
        let data = await buscarRecibo(numeroRecibo);
        console.log("Recibo encontrado:", data);
        if (!Array.isArray(data)) {
          data = data ? [data] : [];
        }
        if (data.length === 0) {
          Swal.fire('Advertencia', 'No se encontró el número de recibo', 'warning');
        }
        setResultado(data);
      } catch (err) {
        Swal.fire('Error', 'El recibo no es válido', 'error');
        setResultado([]);
      }
    }
  }, [busqueda, busquedaManual, buscarReciboConChecksum, buscarRecibo, extractReciboNumber]);

  // Function to process receipt payment; if overdue, payment is prevented
  const handleCobrarRecibo = useCallback(async (recibo) => {
    const hoy = new Date();
    const fechaVencimiento = new Date(recibo.f_vencimiento);
    if (fechaVencimiento < hoy) {
      await Swal.fire('Advertencia', 'El recibo está vencido y no se puede cobrar.', 'warning');
      return;
    }
    const confirmResult = await Swal.fire({
      title: 'Confirmar cobro',
      html: `¿Desea cobrar el <strong>recibo n° ${recibo.n_recibo}</strong> con el <strong>importe: $${recibo.i_total.toFixed(2)}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cobrar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmResult.isConfirmed) {
      try {
        const numRecibo = Number(recibo.n_recibo);
        const response = await pagarRecibo(numRecibo);
        console.log("Recibo cobrado:", response);

        // Check if the response contains "vencido" or "condición de pago: 1"
        if (typeof response === 'string') {
          const responseLower = response.toLowerCase();
          if (responseLower.includes('vencido') || responseLower.includes('condición de pago: 1')) {
            await Swal.fire('Advertencia', response, 'warning');
            return;
          }
        }

        await Swal.fire('Cobrado!', `Recibo ${recibo.n_recibo} cobrado con éxito.`, 'success');
        setResultado(prev => prev.filter(r => r.id !== recibo.id));
        fetchRecibosHoy();
      } catch (err) {
        console.error("Error al cobrar el recibo:", err);
        await Swal.fire('Error', 'Error al cobrar el recibo.', 'error');
      }
    }
  }, [pagarRecibo, fetchRecibosHoy]);

  // Function to cancel a receipt; only enabled if user has the "recibos.anular" permission
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
        if (!motivo) {
          Swal.showValidationMessage("El motivo es obligatorio");
        }
        return motivo;
      },
    });
    if (result.isConfirmed) {
      const comentario = result.value;
      try {
        await customFetch("/recibos/anular", "POST", {
          recibo: recibo.n_recibo,
          comentario: comentario,
        });
        setResultado(prev => prev.filter(r => r.id !== recibo.id));
        setRecibosHoy(prev => prev.filter(r => r.id !== recibo.id));
        Swal.fire("Recibo Anulado", "El recibo se ha anulado correctamente.", "success");
      } catch (error) {
        console.error("Error al anular recibo:", error);
        Swal.fire("Error", "Hubo un problema al anular el recibo.", "error");
      }
    }
  }, []);

  const handleQuitarRecibo = useCallback((reciboId) => {
    setResultado(prev => prev.filter((recibo) => recibo.id !== reciboId));
  }, []);

  const handleLimpiar = useCallback(() => {
    setBusqueda('');
    setResultado([]);
    setBusquedaManual(false);
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Columns for the "Recibo encontrado" table using CommonTable
  const columnasResultado = useMemo(() => [
    { Header: "N° Recibo", accessor: "n_recibo" },
    { 
      Header: "Cliente", 
      accessor: "cliente",
      Cell: ({ row: { original } }) =>
        original.cliente && original.cliente.persona
          ? `${original.cliente.persona.nombre || ''} ${original.cliente.persona.apellido || ''}`.trim()
          : "N/A"
    },
    { 
      Header: "F. Vencimiento", 
      accessor: "f_vencimiento",
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "-"
    },
    { 
      Header: "F. Pago", 
      accessor: "f_pago",
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "-"
    },
    { Header: "Débito", accessor: "i_debito", Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}` },
    { Header: "Recargo", accessor: "i_recargo", Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}` },
    { Header: "Descuento", accessor: "i_descuento", Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}` },
    { Header: "Total", accessor: "i_total", Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}` },
    { 
      Header: "Emisor", 
      accessor: "emisor",
      Cell: ({ value }) => value?.name || "N/A"
    },
    { 
      Header: "Cajero", 
      accessor: "cajero",
      Cell: ({ value }) => value?.name || "N/A"
    },
    { 
      Header: "Condición de Pago", 
      accessor: "condicion_pago",
      Cell: ({ value }) => value ? value.nombre : "N/A"
    },
    {
      Header: "Acciones",
      accessor: "acciones",
      disableSortBy: true,
      Cell: ({ row: { original } }) => {
        const hoy = new Date();
        const fechaVencimiento = new Date(original.f_vencimiento);
        const isOverdue = fechaVencimiento < hoy;
        return (
          <div className="d-flex gap-2">
            {original.condicion_pago && original.condicion_pago.nombre.toLowerCase() === 'anulado' ? (
              <CustomButton variant="secondary" disabled>
                <FaMoneyCheckAlt style={{ marginRight: '5px' }} />
                Anulado
              </CustomButton>
            ) : (
              <>
                {original.f_pago ? (
                  <CustomButton variant="secondary" disabled>
                    <FaMoneyCheckAlt style={{ marginRight: '5px' }} />
                    Pagado
                  </CustomButton>
                ) : isOverdue ? (
                  <CustomButton variant="secondary" disabled>
                    <FaMoneyCheckAlt style={{ marginRight: '5px' }} />
                    Vencido
                  </CustomButton>
                ) : (
                  <CustomButton
                    variant="primary"
                    onClick={() => handleCobrarRecibo(original)}
                    disabled={!hasPermission('recibos.pagar')}
                  >
                    <FaMoneyCheckAlt style={{ marginRight: '5px' }} />
                    Cobrar
                  </CustomButton>
                )}
                <CustomButton
                  variant="warning"
                  onClick={() => handleAnular(original)}
                  disabled={!hasPermission('recibos.anular')}
                >
                  <FaBan style={{ marginRight: '5px' }} />
                  Anular
                </CustomButton>
              </>
            )}
            <CustomButton variant="danger" onClick={() => handleQuitarRecibo(original.id)}>
              <FaTrashAlt style={{ marginRight: '5px' }} />
              Quitar
            </CustomButton>
          </div>
        );
      },
    },
  ], [handleCobrarRecibo, handleAnular, handleQuitarRecibo, hasPermission]);

  // Columns for the "Recibos pagados hoy" table
  const columnasPagados = useMemo(() => [
    { Header: "N° Recibo", accessor: "n_recibo" },
    { 
      Header: "Cliente", 
      accessor: "cliente",
      Cell: ({ row: { original } }) =>
        original.cliente && original.cliente.persona
          ? `${original.cliente.persona.nombre || ''} ${original.cliente.persona.apellido || ''}`.trim()
          : "N/A"
    },
    { 
      Header: "F. Pago", 
      accessor: "f_pago",
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "-"
    },
    { Header: "Total", accessor: "i_total", Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}` },
    { 
      Header: "Emisor", 
      accessor: "emisor",
      Cell: ({ value }) => value?.name || "N/A"
    },
    { 
      Header: "Cajero", 
      accessor: "cajero",
      Cell: ({ value }) => value?.name || "N/A"
    },
    {
      Header: "Acciones",
      accessor: "acciones",
      disableSortBy: true,
      Cell: ({ row: { original } }) =>
        original.condicion_pago && original.condicion_pago.nombre.toLowerCase() === "anulado" ? (
          <CustomButton variant="secondary" disabled>
            <FaTrashAlt style={{ marginRight: '5px' }} />
            Anulado
          </CustomButton>
        ) : (
          <CustomButton
            variant="warning"
            onClick={() => handleAnular(original)}
            disabled={!hasPermission('recibos.anular')}
          >
            <FaBan style={{ marginRight: '5px' }} />
            Anular
          </CustomButton>
        ),
    },
  ], [handleAnular, hasPermission]);

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
        Busca un recibo leyendo el código de barra o activa la busqueda manual e ingresa el número de recibo.
      </p>

      {/* Search Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form.Group controlId="busqueda" className="mb-3">
            <Form.Label>Buscar recibo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Lea el codigo de barra con el lector o ingrese número de recibo"
              value={busqueda}
              ref={inputRef}
              onChange={(e) => {
                setBusqueda(e.target.value);
                console.log("Valor de búsqueda completo:", e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleBuscarRecibo();
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              aria-label="Búsqueda de recibo"
              autoFocus
            />
            <Form.Switch 
              id="busqueda-manual-switch"
              label="Búsqueda manual"
              className="mt-2"
              checked={busquedaManual}
              onChange={(e) => setBusquedaManual(e.target.checked)}
            />
          </Form.Group>
          <div className="d-flex align-items-center gap-2">
            <CustomButton 
              variant="primary" 
              onClick={handleBuscarRecibo} 
              disabled={loading || !hasPermission('recibos.show')}
            >
              <FaSearch style={{ marginRight: '5px' }} />
              {loading ? 'Buscando...' : 'Buscar Recibo'}
            </CustomButton>
            <CustomButton variant="danger" onClick={handleLimpiar} disabled={loading}>
              <FaEraser style={{ marginRight: '5px' }} />
              Limpiar
            </CustomButton>
          </div>
          {error && <p className="text-danger mt-2">{error}</p>}
        </Card.Body>
      </Card>

      {/* "Recibo encontrado" Section */}
      {resultado.length > 0 && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h4>Recibo encontrado</h4>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </Spinner>
              </div>
            ) : (
              <CommonTable columns={columnasResultado} data={resultado} />
            )}
          </Card.Body>
        </Card>
      )}

      {/* "Recibos pagados hoy" Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Recibos pagados hoy</h4>
            {hasPermission('recibos.index-pagados') && (
              <CustomButton variant="primary" onClick={fetchRecibosHoy}>
                <FaSyncAlt style={{ marginRight: '5px' }} />
                Refrescar
              </CustomButton>
            )}
          </div>
          {loadingRecibosHoy ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          ) : !hasPermission('recibos.index-pagados') ? (
            <div 
              className="text-center text-danger" 
              style={{ padding: '20px', border: '1px solid #dee2e6', borderRadius: '4px' }}
            >
              Tu usuario no cuenta con autorización para ver los recibos pagados.
            </div>
          ) : recibosHoy.length > 0 ? (
            <CommonTable columns={columnasPagados} data={recibosHoy} />
          ) : (
            <p className="text-center">No se encontraron recibos pagados hoy.</p>
          )}
        </Card.Body>
      </Card>
    </Card>
  );
};

export default CajaHome;

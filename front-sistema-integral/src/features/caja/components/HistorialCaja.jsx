// src/features/facturacion/components/HistorialCaja.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Table, Row, Col, Button, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch.js';
import DetalleReciboModal from '../../../components/common/modals/DetalleReciboModal.jsx';

const HistorialCaja = () => {
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para los filtros
  const [filtroRecibo, setFiltroRecibo] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroImporteMin, setFiltroImporteMin] = useState('');
  const [filtroImporteMax, setFiltroImporteMax] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroCajero, setFiltroCajero] = useState('');

  // Estado para el modal de detalle
  const [selectedRecibo, setSelectedRecibo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Función para obtener el historial de recibos (todos los que tengan f_pago !== null)
  const fetchHistorialRecibos = useCallback(async () => {
    setLoading(true);
    try {
      let data = await customFetch('/recibos');
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        data = data[0];
      }
      const historial = data.filter((r) => r.f_pago !== null);
      setRecibos(historial);
    } catch (error) {
      console.error("Error al obtener el historial de recibos:", error);
      Swal.fire('Error', 'Error al obtener el historial de recibos.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistorialRecibos();
  }, [fetchHistorialRecibos]);

  // Filtrado de recibos según los filtros ingresados
  const filteredRecibos = recibos.filter((r) => {
    let pass = true;
    if (filtroRecibo) {
      pass = pass && r.n_recibo.toString().includes(filtroRecibo);
    }
    if (filtroFechaDesde) {
      const desde = new Date(filtroFechaDesde);
      const fechaRecibo = new Date(r.f_pago);
      pass = pass && fechaRecibo >= desde;
    }
    if (filtroFechaHasta) {
      const hasta = new Date(filtroFechaHasta);
      const fechaRecibo = new Date(r.f_pago);
      pass = pass && fechaRecibo <= hasta;
    }
    if (filtroImporteMin) {
      pass = pass && r.i_total >= parseFloat(filtroImporteMin);
    }
    if (filtroImporteMax) {
      pass = pass && r.i_total <= parseFloat(filtroImporteMax);
    }
    // Como en la tabla ya no mostramos los nombres enriquecidos,
    // para filtrar por cliente o cajero se usan los ID (o se puede omitir este filtro)
    if (filtroCliente) {
      pass = pass && r.cliente_id && r.cliente_id.toString().includes(filtroCliente);
    }
    if (filtroCajero) {
      pass = pass && r.cajero_id && r.cajero_id.toString().includes(filtroCajero);
    }
    return pass;
  });

  const resetFilters = () => {
    setFiltroRecibo('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setFiltroImporteMin('');
    setFiltroImporteMax('');
    setFiltroCliente('');
    setFiltroCajero('');
  };

  // Al hacer clic en "Ver Detalle" se guarda el recibo y se abre el modal.
  const handleVerDetalle = (recibo) => {
    setSelectedRecibo(recibo);
    setShowModal(true);
  };

  return (
    <Card className="shadow-sm p-4 mt-4">
      <h2 className="text-center mb-4">Historial de Recibos</h2>
      <Card.Body>
        <Form className="mb-4">
          <Row>
            <Col md={3}>
              <Form.Group controlId="filtroRecibo">
                <Form.Label>N° Recibo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por recibo"
                  value={filtroRecibo}
                  onChange={(e) => setFiltroRecibo(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroFechaDesde">
                <Form.Label>Fecha Desde</Form.Label>
                <Form.Control
                  type="date"
                  value={filtroFechaDesde}
                  onChange={(e) => setFiltroFechaDesde(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroFechaHasta">
                <Form.Label>Fecha Hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={filtroFechaHasta}
                  onChange={(e) => setFiltroFechaHasta(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroImporteMin">
                <Form.Label>Importe Mínimo</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Min"
                  value={filtroImporteMin}
                  onChange={(e) => setFiltroImporteMin(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={3}>
              <Form.Group controlId="filtroImporteMax">
                <Form.Label>Importe Máximo</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Max"
                  value={filtroImporteMax}
                  onChange={(e) => setFiltroImporteMax(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroCliente">
                <Form.Label>Cliente (ID)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="ID del cliente"
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroCajero">
                <Form.Label>Cajero (ID)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="ID del cajero"
                  value={filtroCajero}
                  onChange={(e) => setFiltroCajero(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="secondary" onClick={resetFilters}>
                Limpiar filtros
              </Button>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={12} className="text-end">
              <Button variant="primary" onClick={fetchHistorialRecibos}>
                Actualizar Historial
              </Button>
              <Button variant="primary" onClick={resetFilters} className="ms-2">
                Limpiar filtros
              </Button>
              <Button variant="primary" onClick={() => {
                // Si se aplica algún filtro, ejecutar la búsqueda manual
                if (
                  filtroRecibo ||
                  filtroFechaDesde ||
                  filtroFechaHasta ||
                  filtroImporteMin ||
                  filtroImporteMax ||
                  filtroCliente ||
                  filtroCajero
                ) {
                  // Aquí se usa la función de filtrado local; si se quisiera hacer la búsqueda desde el servidor, se ajusta la llamada.
                  // Por ahora, simplemente se actualiza la lista filtrada:
                  // (Si el endpoint soporta filtros, se puede construir un query string y llamar a customFetch)
                } else {
                  Swal.fire('Advertencia', 'Debe ingresar al menos un criterio de búsqueda.', 'warning');
                }
              }} className="ms-2">
                Buscar
              </Button>
            </Col>
          </Row>
        </Form>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>N° Recibo</th>
                <th>Fecha de Pago</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecibos.length > 0 ? (
                filteredRecibos.map((recibo) => (
                  <tr key={recibo.id}>
                    <td>{recibo.n_recibo}</td>
                    <td>{new Date(recibo.f_pago).toLocaleDateString()}</td>
                    <td>$ {recibo.i_total.toFixed(2)}</td>
                    <td>
                      <Button variant="info" onClick={() => handleVerDetalle(recibo)}>
                        Ver Detalle
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No se encontraron recibos que cumplan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Card.Body>
      {showModal && selectedRecibo && (
        <DetalleReciboModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          recibo={selectedRecibo}
        />
      )}
    </Card>
  );
};

export default HistorialCaja;

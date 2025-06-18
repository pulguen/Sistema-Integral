import React, { useState, useEffect, useMemo } from 'react';
import { Card, Breadcrumb, Form, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch.js';
import DetalleReciboModal from '../../../components/common/modals/DetalleReciboModal.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import CommonTable from '../../../components/common/table/table.jsx';
import { FaEye } from 'react-icons/fa';

const PAGE_SIZE_OPTIONS = [15, 30, 45, 60];

const HistorialCaja = () => {
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtroRecibo, setFiltroRecibo] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroImporteMin, setFiltroImporteMin] = useState('');
  const [filtroImporteMax, setFiltroImporteMax] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroCajero, setFiltroCajero] = useState('');

  const [selectedRecibo, setSelectedRecibo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  useEffect(() => {
    const fetchHistorialRecibos = async () => {
      setLoading(true);
      try {
        const response = await customFetch(`/recibos`);
        // La respuesta es { data: Array }
        const allData = response?.data || [];
        // Filtra solo pagados
        const historial = allData
          .filter(r => r.condicion_pago_id === 1)
          .sort((a, b) => new Date(b.f_pago || b.f_vencimiento) - new Date(a.f_pago || a.f_vencimiento));
        setRecibos(historial);
      } catch (error) {
        console.error("Error al obtener el historial de recibos:", error);
        Swal.fire('Error', 'Error al obtener el historial de recibos.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchHistorialRecibos();
  }, [filtroCliente, filtroCajero, filtroFechaDesde, filtroFechaHasta]);

  const filteredRecibos = useMemo(() => recibos.filter((r) => {
    let pass = true;
    if (filtroRecibo) pass = pass && r.n_recibo?.toString().includes(filtroRecibo);
    if (filtroFechaDesde) pass = pass && r.f_pago && new Date(r.f_pago) >= new Date(filtroFechaDesde);
    if (filtroFechaHasta) pass = pass && r.f_pago && new Date(r.f_pago) <= new Date(filtroFechaHasta);
    if (filtroImporteMin) pass = pass && r.i_total >= parseFloat(filtroImporteMin);
    if (filtroImporteMax) pass = pass && r.i_total <= parseFloat(filtroImporteMax);
    if (filtroCliente) pass = pass && r.cliente_id?.toString().includes(filtroCliente);
    if (filtroCajero) pass = pass && r.cajero_id?.toString().includes(filtroCajero);
    return pass;
  }), [recibos, filtroRecibo, filtroFechaDesde, filtroFechaHasta, filtroImporteMin, filtroImporteMax, filtroCliente, filtroCajero]);

  const currentPageData = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredRecibos.slice(start, start + pageSize);
  }, [filteredRecibos, pageIndex, pageSize]);

  const resetFilters = () => {
    setFiltroRecibo('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setFiltroImporteMin('');
    setFiltroImporteMax('');
    setFiltroCliente('');
    setFiltroCajero('');
    setPageIndex(0);
  };

  const handleVerDetalle = (recibo) => {
    setSelectedRecibo(recibo);
    setShowModal(true);
  };

  const columns = useMemo(() => [
    { Header: 'N° Recibo', accessor: 'n_recibo' },
    {
      Header: 'Fecha de Pago',
      accessor: 'f_pago',
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      Header: 'Total',
      accessor: 'i_total',
      Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
    },
    {
      Header: 'Acciones',
      accessor: 'acciones',
      disableSortBy: true,
      Cell: ({ row: { original } }) => (
        <CustomButton variant="info" onClick={() => handleVerDetalle(original)}>
          <FaEye className="me-2" /> ver
        </CustomButton>
      )
    }
  ], []);

  return (
    <Card className="shadow-sm p-4 mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/caja" }}>
          Home Caja
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Historial de Recibos</Breadcrumb.Item>
      </Breadcrumb>
      <h2 className="text-center mb-4 text-primary">Historial de Recibos</h2>
      <Card.Body>
        <Form className="mb-4">
          <Row>
            <Col md={3}>
              <Form.Group controlId="filtroRecibo">
                <Form.Label>N° Recibo</Form.Label>
                <Form.Control type="text" value={filtroRecibo} onChange={(e) => setFiltroRecibo(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroFechaDesde">
                <Form.Label>Fecha Desde</Form.Label>
                <Form.Control type="date" value={filtroFechaDesde} onChange={(e) => setFiltroFechaDesde(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroFechaHasta">
                <Form.Label>Fecha Hasta</Form.Label>
                <Form.Control type="date" value={filtroFechaHasta} onChange={(e) => setFiltroFechaHasta(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroImporteMin">
                <Form.Label>Importe Mínimo</Form.Label>
                <Form.Control type="number" value={filtroImporteMin} onChange={(e) => setFiltroImporteMin(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={3}>
              <Form.Group controlId="filtroImporteMax">
                <Form.Label>Importe Máximo</Form.Label>
                <Form.Control type="number" value={filtroImporteMax} onChange={(e) => setFiltroImporteMax(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroCliente">
                <Form.Label>Cliente (ID)</Form.Label>
                <Form.Control type="text" value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroCajero">
                <Form.Label>Cajero (ID)</Form.Label>
                <Form.Control type="text" value={filtroCajero} onChange={(e) => setFiltroCajero(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <CustomButton variant="secondary" onClick={resetFilters}>Limpiar filtros</CustomButton>
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
          <CommonTable
            columns={columns}
            data={currentPageData}
            initialPageIndex={pageIndex}
            initialPageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
          />
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

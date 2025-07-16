import React, { useContext, useState, useEffect } from 'react';
import { CajaContext } from '../../../context/CajaContext';
import { Card, Breadcrumb, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import BusquedaRapidaForm from './BusquedaRapidaForm';
import BusquedaAvanzadaForm from './BusquedaAvanzadaForm';
import HistorialCajaTable from './HistorialCajaTable';
import DetalleReciboModal from '../../../components/common/modals/DetalleReciboModal.jsx';
import formatNumber from '../../../utils/formatNumber';

const HistorialCaja = () => {
  const {
    recibos, loading, pageIndex, setPageIndex, pageSize, setPageSize,
    showModal, abrirModalDetalle, cerrarModalDetalle, reciboSeleccionado,
    setRecibos, limpiarFiltrosAvanzados
  } = useContext(CajaContext);

  const [activeTab, setActiveTab] = useState('rapida');
  const [resetSignal, setResetSignal] = useState(0);

  // Limpia TODO al cambiar de tab
  useEffect(() => {
    setRecibos([]);
    setPageIndex(0);
    setResetSignal(s => s + 1); // trigger reset en los forms hijos
    limpiarFiltrosAvanzados();
  }, [activeTab, setRecibos, setPageIndex, limpiarFiltrosAvanzados]);

  const pageCount = Math.max(1, Math.ceil(recibos.length / pageSize));
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex + 1 < pageCount;

  const gotoPage = (p) => setPageIndex(p);
  const previousPage = () => { if (canPreviousPage) setPageIndex(pageIndex - 1); };
  const nextPage = () => { if (canNextPage) setPageIndex(pageIndex + 1); };

  // Slice local
  const paginatedRecibos = recibos.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  // Columnas...
  const columns = [
    { Header: '#', accessor: 'nro' },
    { Header: 'N° Recibo', accessor: 'n_recibo' },
    {
      Header: 'Fecha de Pago',
      accessor: 'f_pago',
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      Header: 'Total',
      accessor: 'i_total',
      Cell: ({ value }) => `$ ${formatNumber(value)}`
    },
    { Header: 'Cliente', accessor: 'cliente_nombre' },
    { Header: 'Cajero', accessor: 'cajero_nombre' },
    {
      Header: 'Condición',
      accessor: 'condicion_nombre',
      Cell: ({ row }) => (
        <span className={`badge bg-${row.original.condicion_color}`}>
          {row.original.condicion_nombre}
        </span>
      )
    },
    {
      Header: 'Acciones',
      accessor: 'acciones',
      Cell: ({ row }) => (
        <button className="btn btn-info btn-sm" onClick={() => abrirModalDetalle(row.original)}>
          Ver
        </button>
      )
    }
  ];

  return (
    <Card className="shadow-sm p-4 mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/caja" }}>Home Caja</Breadcrumb.Item>
        <Breadcrumb.Item active>Historial de Recibos</Breadcrumb.Item>
      </Breadcrumb>
      <h2 className="text-center mb-2 text-primary">Historial de Cobros</h2>
      <h4 className="text-center mb-4 text-primary">Búsqueda de recibos cobrados</h4>
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3" justify>
        <Tab eventKey="rapida" title="Búsqueda rápida">
          <BusquedaRapidaForm resetSignal={resetSignal} />
        </Tab>
        <Tab eventKey="avanzada" title="Búsqueda avanzada">
          <BusquedaAvanzadaForm resetSignal={resetSignal} />
        </Tab>
      </Tabs>
      {/* TABLA */}
      <HistorialCajaTable
        data={paginatedRecibos}
        loading={loading}
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={pageCount}
        gotoPage={gotoPage}
        previousPage={previousPage}
        nextPage={nextPage}
        setPageSize={setPageSize}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        columns={columns}
      />
      <DetalleReciboModal
        show={showModal}
        recibo={reciboSeleccionado}
        handleClose={cerrarModalDetalle}
      />
    </Card>
  );
};

export default HistorialCaja;

import React, { useMemo } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { FaSyncAlt } from 'react-icons/fa';
import CommonTable from '../../../components/common/table/table.jsx';
import ResumenTotalesRecibosHoy from './ResumenTotalesRecibosHoy';

const RecibosProcesadosHoy = ({
  recibosHoy,
  loadingRecibosHoy,
  fetchRecibosHoy,
  canViewPaid,
  columns
}) => {
  // Separar cobrados y anulados
  const recibosCobrados = useMemo(
    () =>
      recibosHoy.filter(
        r => r.condicion_pago?.nombre?.toLowerCase() === 'pagado'
      ),
    [recibosHoy]
  );

  const recibosAnulados = useMemo(
    () =>
      recibosHoy.filter(
        r => r.condicion_pago?.nombre?.toLowerCase() === 'anulado'
      ),
    [recibosHoy]
  );

  // Columnas, mismas para ambas tablas
  const defaultColumns = useMemo(() => [
    { Header: "N° Recibo", accessor: "n_recibo" },
    { 
      Header: "Cliente", 
      accessor: "cliente",
      Cell: ({ row: { original } }) =>
        original.cliente && original.cliente.clientable
          ? `${original.cliente.clientable.nombre || ''} ${original.cliente.clientable.apellido || ''}`.trim()
          : "N/A"
    },
    {
      Header: "Cajero",
      accessor: "cajero",
      Cell: ({ row: { original } }) =>
        original.cajero
          ? `${original.cajero.name || original.cajero.nombre || ''} ${original.cajero.apellido || ''}`.trim()
          : "N/A"
    },
    { 
      Header: "Fecha de Pago", 
      accessor: "f_pago",
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "-" 
    },
    { Header: "Total", accessor: "i_total", Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}` },
    // Puedes agregar más columnas si quieres
  ], []);

  const cols = columns || defaultColumns;

  return (
    <Card className="mt-3 mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Recibos procesados hoy</h4>
          {canViewPaid && (
            <CustomButton variant="primary" onClick={fetchRecibosHoy}>
              <FaSyncAlt style={{ marginRight: '5px' }} />
              Refrescar
            </CustomButton>
          )}
        </div>

        <ResumenTotalesRecibosHoy recibosHoy={recibosHoy} />
        {loadingRecibosHoy ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        ) : !canViewPaid ? (
          <div 
            className="text-center text-danger" 
            style={{ padding: '20px', border: '1px solid #dee2e6', borderRadius: '4px' }}
          >
            Tu usuario no cuenta con autorización para ver los recibos procesados.
          </div>
        ) : (
          <>
            {/* Tabla de cobrados */}
            <h5 className="mb-2 mt-4 text-success">Recibos cobrados hoy</h5>
            {recibosCobrados.length > 0 ? (
              <CommonTable data={recibosCobrados} columns={cols} />
            ) : (
              <p className="text-center text-muted">No se encontraron recibos cobrados hoy.</p>
            )}

            {/* Tabla de anulados */}
            <h5 className="mb-2 mt-5 text-danger">Recibos anulados hoy</h5>
            {recibosAnulados.length > 0 ? (
              <CommonTable data={recibosAnulados} columns={cols} />
            ) : (
              <p className="text-center text-muted">No se encontraron recibos anulados hoy.</p>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecibosProcesadosHoy;
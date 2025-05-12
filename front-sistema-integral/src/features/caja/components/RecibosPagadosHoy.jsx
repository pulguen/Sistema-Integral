import React, { useMemo } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { FaSyncAlt } from 'react-icons/fa';
import CommonTable from '../../../components/common/table/table.jsx';

const RecibosPagadosHoy = ({ recibosHoy, loadingRecibosHoy, fetchRecibosHoy, canViewPaid, columns }) => {
  // Definir las columnas por defecto, asegurándonos de transformar "cliente" en string
  const defaultColumns = useMemo(() => [
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
      Header: "Fecha de Pago", 
      accessor: "f_pago",
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "-" 
    },
    { Header: "Total", accessor: "i_total", Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}` },
  ], []);

  const cols = columns || defaultColumns;

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Recibos pagados hoy</h4>
          {canViewPaid && (
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
        ) : !canViewPaid ? (
          <div 
            className="text-center text-danger" 
            style={{ padding: '20px', border: '1px solid #dee2e6', borderRadius: '4px' }}
          >
            Tu usuario no cuenta con autorización para ver los recibos pagados.
          </div>
        ) : recibosHoy.length > 0 ? (
          <CommonTable data={recibosHoy} columns={cols} />
        ) : (
          <p className="text-center">No se encontraron recibos pagados hoy.</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecibosPagadosHoy;

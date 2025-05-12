import React, { useMemo } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { FaMoneyCheckAlt, FaBan, FaTrashAlt } from 'react-icons/fa';
import CommonTable from '../../../components/common/table/table.jsx';

const ReciboResult = ({
  resultado,
  loading,
  handleCobrarRecibo,
  handleAnular,
  handleQuitarRecibo,
  hasPermission
}) => {
  // Envuelve hasPermission en useMemo para asegurar que su referencia sea estable
  const checkPermission = useMemo(() => {
    return typeof hasPermission === 'function' ? hasPermission : () => false;
  }, [hasPermission]);

  // Definición de columnas tal como en tu implementación original
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
    { 
      Header: "Débito", 
      accessor: "i_debito", 
      Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
    },
    { 
      Header: "Recargo", 
      accessor: "i_recargo", 
      Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
    },
    { 
      Header: "Descuento", 
      accessor: "i_descuento", 
      Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
    },
    { 
      Header: "Total", 
      accessor: "i_total", 
      Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
    },
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
                    disabled={!checkPermission('recibos.pagar')}
                  >
                    <FaMoneyCheckAlt style={{ marginRight: '5px' }} />
                    Cobrar
                  </CustomButton>
                )}
                <CustomButton
                  variant="warning"
                  onClick={() => handleAnular(original)}
                  disabled={!checkPermission('recibos.anular')}
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
  ], [handleCobrarRecibo, handleAnular, handleQuitarRecibo, checkPermission]);

  return (
    resultado && resultado.length > 0 && (
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
    )
  );
};

export default ReciboResult;

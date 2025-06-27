import React, { useMemo } from 'react';
import { Card, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { FaMoneyCheckAlt, FaBan, FaTrashAlt } from 'react-icons/fa';
import CommonTable from '../../../components/common/table/table.jsx';

const ReciboResult = ({
  resultado,
  loading,
  handleCobrarRecibo,
  handleAnular,
  handleQuitarRecibo,
  hasPermission,
  cajaCerrada
}) => {
  const checkPermission = useMemo(() => {
    return typeof hasPermission === 'function' ? hasPermission : () => false;
  }, [hasPermission]);

  const columnasResultado = useMemo(() => [
    { Header: "N° Recibo", accessor: "n_recibo" },
    {
      Header: "Cliente",
      accessor: "cliente",
      Cell: ({ row: { original } }) => {
        const clientable = original?.cliente?.clientable;
        return clientable
          ? `${clientable.nombre || ''} ${clientable.apellido || ''}`.trim() || "N/A"
          : "N/A";
      }
    },
    {
      Header: "Vencimiento",
      accessor: "f_vencimiento",
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "-"
    },
    { Header: "Importe", accessor: "i_debito", Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}` },
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
      Header: "Cond. de Pago",
      accessor: "condicion_pago",
      Cell: ({ value }) => value ? value.nombre : "N/A"
    },
    {
      Header: "F. Pago",
      accessor: "f_pago",
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "-"
    },
    {
      Header: "Acciones",
      accessor: "acciones",
      disableSortBy: true,
      Cell: ({ row: { original } }) => {
        const hoy = new Date();
        const fechaVencimiento = new Date(original.f_vencimiento);
        const isOverdue = fechaVencimiento < hoy;
        const isAnulado = original.condicion_pago?.nombre.toLowerCase() === 'anulado';
        const isPagado = Boolean(original.f_pago);

        // Tooltip contextual
        let cobrarTooltip = '';
        if (cajaCerrada) cobrarTooltip = 'La caja ya fue cerrada por hoy.';
        else if (loading) cobrarTooltip = 'Espere a que termine el proceso de cobro.';

        return (
          <div className="d-flex gap-2">
            {isAnulado ? (
              <CustomButton variant="danger" disabled>
                <FaMoneyCheckAlt style={{ marginRight: '5px' }} />
                Anulado
              </CustomButton>
            ) : (
              <>
                {isPagado ? (
                  <CustomButton variant="secondary" disabled>
                    <FaMoneyCheckAlt style={{ marginRight: '5px' }} />
                    Pagado
                  </CustomButton>
                ) : isOverdue ? (
                  <CustomButton variant="alternative" disabled>
                    <FaMoneyCheckAlt style={{ marginRight: '5px' }} />
                    Vencido
                  </CustomButton>
                ) : (
                  checkPermission('recibos.pagar') && (
                    <OverlayTrigger
                      overlay={
                        (cajaCerrada || loading)
                          ? <Tooltip>{cobrarTooltip}</Tooltip>
                          : <></>
                      }
                    >
                      <span>
                        <CustomButton
                          variant="primary"
                          onClick={() => handleCobrarRecibo(original.n_recibo)}
                          disabled={cajaCerrada || loading}
                          tabIndex={cajaCerrada || loading ? -1 : 0}
                        >
                          {loading
                            ? (
                                <>
                                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                                  Procesando...
                                </>
                              )
                            : (
                                <>
                                  <FaMoneyCheckAlt style={{ marginRight: '5px' }} />
                                  Cobrar
                                </>
                              )
                          }
                        </CustomButton>
                      </span>
                    </OverlayTrigger>
                  )
                )}
                {checkPermission('recibos.anular') && (
                  <CustomButton
                    variant="warning"
                    onClick={() => handleAnular(original)}
                    disabled={isPagado || cajaCerrada || loading}
                  >
                    <FaBan style={{ marginRight: '5px' }} />
                    Anular
                  </CustomButton>
                )}
              </>
            )}
            <CustomButton variant="danger" onClick={() => handleQuitarRecibo(original.id)}>
              <FaTrashAlt style={{ marginRight: '5px' }} />
              Quitar
            </CustomButton>
          </div>
        );
      }
    }
  ], [handleCobrarRecibo, handleAnular, handleQuitarRecibo, checkPermission, cajaCerrada, loading]);

  return (
    resultado && resultado.length > 0 && (
      <Card className="mb-4 mt-4 shadow-sm">
        <Card.Body>
          <h4>Recibos encontrados</h4>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <CommonTable columns={columnasResultado} data={resultado} />
              {resultado.length === 0 && (
                <div className="text-muted text-center mt-2">No se encontró ningún recibo.</div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    )
  );
};

export default ReciboResult;

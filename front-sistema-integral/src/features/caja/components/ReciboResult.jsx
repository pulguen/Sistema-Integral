import React, { useMemo, useState } from 'react';
import { Card, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { FaMoneyCheckAlt, FaBan, FaTrashAlt, FaEye } from 'react-icons/fa';
import CommonTable from '../../../components/common/table/table.jsx';
import formatNumber from '../../../utils/formatNumber.js';
import DetalleReciboModal from '../../../components/common/modals/DetalleReciboModal.jsx';

const ReciboResult = ({
  resultado,
  loading,
  handleCobrarRecibo,
  handleAnular,
  handleQuitarRecibo,
  hasPermission,
  cajaCerrada
}) => {
  // Estado para modal de detalle
  const [showDetalle, setShowDetalle] = useState(false);
  const [reciboSeleccionado, setReciboSeleccionado] = useState(null);

  const checkPermission = useMemo(() => {
    return typeof hasPermission === 'function' ? hasPermission : () => false;
  }, [hasPermission]);

  const handleVerDetalle = (recibo) => {
    setReciboSeleccionado(recibo);
    setShowDetalle(true);
  };

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
    {
      Header: "Importe",
      accessor: "i_debito",
      Cell: ({ value }) => <span>$ {formatNumber(value)}</span>
    },
    {
      Header: "Recargo",
      accessor: "i_recargo",
      Cell: ({ value }) => (
        <span className={Number(value) > 0 ? "text-danger fw-semibold" : ""}>
          $ {formatNumber(value)}
        </span>
      )
    },
    {
      Header: "Descuento",
      accessor: "i_descuento",
      Cell: ({ value }) => (
        <span className="text-success">
          $ {formatNumber(value)}
        </span>
      )
    },
    {
      Header: "Total",
      accessor: "i_total",
      Cell: ({ value }) => <strong>$ {formatNumber(value)}</strong>
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
        const isAnulado = original.condicion_pago?.nombre?.toLowerCase() === 'anulado';
        const isPagado = Boolean(original.f_pago);

        let cobrarTooltip = '';
        if (cajaCerrada) cobrarTooltip = 'La caja ya fue cerrada por hoy.';
        else if (loading) cobrarTooltip = 'Espere a que termine el proceso de cobro.';

        return (
          <div className="d-flex gap-2">
            {/* Ver Detalle */}
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Ver detalle del recibo</Tooltip>}
            >
              <span className="d-inline-block">
                <CustomButton
                  variant="info"
                  size="sm"
                  onClick={() => handleVerDetalle(original)}
                >
                  <FaEye />
                </CustomButton>
              </span>
            </OverlayTrigger>
            {/* Anulado / Pagado / Vencido / Cobrar */}
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
            {/* Quitar */}
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
      <>
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
        {/* Modal de detalle */}
        <DetalleReciboModal
          show={showDetalle}
          handleClose={() => setShowDetalle(false)}
          recibo={reciboSeleccionado}
        />
      </>
    )
  );
};

export default ReciboResult;

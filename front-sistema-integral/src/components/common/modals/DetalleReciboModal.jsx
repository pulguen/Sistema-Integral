import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch';
import formatNumber from '../../../utils/formatNumber';
import '../../../styles/DetalleReciboModal.css';

const DetalleReciboModal = ({ show, handleClose, recibo }) => {
  const [detalleRecibo, setDetalleRecibo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetalleRecibo = useCallback(async () => {
    setLoading(true);
    try {
      let clientName = 'N/A';
      if (recibo?.cliente?.clientable) {
        const c = recibo.cliente.clientable;
        clientName = c.razon_social
          ? c.razon_social
          : `${c.nombre || ''} ${c.apellido || ''}`.trim();
      } else if (recibo.cliente_id) {
        const clientData = await customFetch(`/clientes/${recibo.cliente_id}`, 'GET');
        if (clientData && clientData.persona) {
          clientName = `${clientData.persona.nombre || ''} ${clientData.persona.apellido || ''}`.trim();
        }
      }

      // Emisor
      let emitterName = 'N/A';
      if (recibo?.emisor?.name) {
        emitterName = recibo.emisor.name;
      } else if (recibo.emisor_id) {
        const emitterData = await customFetch(`/users/${recibo.emisor_id}`, 'GET');
        if (emitterData?.name) emitterName = emitterData.name;
      }

      // Cajero
      let cashierName = 'N/A';
      if (recibo?.cajero?.name) {
        cashierName = recibo.cajero.name;
      } else if (recibo.cajero_id) {
        const cashierData = await customFetch(`/users/${recibo.cajero_id}`, 'GET');
        if (cashierData?.name) cashierName = cashierData.name;
      }

      setDetalleRecibo({
        ...recibo,
        cliente_nombre: clientName,
        emisor_nombre: emitterName,
        cajero_nombre: cashierName,
      });
    } catch (error) {
      console.error("Error al obtener detalle del recibo:", error);
      Swal.fire('Error', 'Error al obtener detalle del recibo.', 'error');
    } finally {
      setLoading(false);
    }
  }, [recibo]);

  useEffect(() => {
    if (show) fetchDetalleRecibo();
  }, [show, fetchDetalleRecibo]);

  // Si algún campo no está, que ponga 0 o '-'
  const getField = (obj, key, isNumber = false) => {
    if (!obj || typeof obj[key] === "undefined" || obj[key] === null) return isNumber ? 0 : '-';
    return obj[key];
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <span className="titulo-muni">Municipalidad de Zapala</span><br />
          <span className="subtitulo-muni">Detalle del Recibo</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading || !detalleRecibo ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {/* Datos principales */}
            <table className="recibo-header-table print-table">
              <tbody>
                <tr>
                  <td className="label">N° Recibo</td>
                  <td>{detalleRecibo.n_recibo}</td>
                  <td className="label">Cliente</td>
                  <td>{detalleRecibo.cliente_nombre}</td>
                  <td className="label">Emisor</td>
                  <td>{detalleRecibo.emisor_nombre}</td>
                  <td className="label">Cajero</td>
                  <td>{detalleRecibo.cajero_nombre}</td>
                </tr>
                <tr>
                  <td className="label">Fecha de Vencimiento</td>
                  <td>
                    {detalleRecibo.f_vencimiento
                      ? new Date(detalleRecibo.f_vencimiento).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="label">Fecha de Pago</td>
                  <td>
                    {detalleRecibo.f_pago
                      ? new Date(detalleRecibo.f_pago).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="label">Condición</td>
                  <td colSpan={3}>
                    {detalleRecibo.condicion_pago?.nombre || 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Comentario si está anulado */}
            {detalleRecibo.condicion_pago_id === 2 &&
              Array.isArray(detalleRecibo.comentarios) &&
              detalleRecibo.comentarios.length > 0 && (
                <Alert variant="danger" className="mt-2">
                  <strong>Motivo de anulación:</strong>
                  <ul className="mb-0">
                    {detalleRecibo.comentarios.map((c, idx) => (
                      <li key={c.id || idx}>{c.cuerpo}</li>
                    ))}
                  </ul>
                </Alert>
              )}

            {/* Tabla completa de detalles */}
            <div className="table-responsive-print mt-4">
              <table className="detalle-cuotas-table print-table">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Año</th>
                    <th>Cuota</th>
                    <th>Débito</th>
                    <th>Recargo</th>
                    <th>Descuento</th>
                    <th>Total</th>
                    <th>Fecha de Vencimiento</th>
                    <th>Tributo</th>
                    <th>Servicio</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleRecibo.detalles && detalleRecibo.detalles.length > 0 ? (
                    detalleRecibo.detalles.map((d, idx) => {
                      // Si el total viene en el detalle usalo, si no calculalo:
                      const totalDetalle = (typeof d.i_total !== "undefined" && d.i_total !== null)
                        ? d.i_total
                        : Number(getField(d, 'i_debito', true)) + Number(getField(d, 'i_recargo', true)) - Number(getField(d, 'i_descuento', true));

                      return (
                        <tr key={idx}>
                          <td>{getField(d, 'mes')}</td>
                          <td>{getField(d, 'año')}</td>
                          <td>{getField(d, 'cuota')}</td>
                          <td>$ {formatNumber(getField(d, 'i_debito', true))}</td>
                          <td>$ {formatNumber(getField(d, 'i_recargo', true))}</td>
                          <td>$ {formatNumber(getField(d, 'i_descuento', true))}</td>
                          <td className="text-success"><strong>$ {formatNumber(totalDetalle)}</strong></td>
                          <td>
                            {d.cuenta?.f_vencimiento
                              ? new Date(d.cuenta.f_vencimiento).toLocaleDateString()
                              : '-'}
                          </td>
                          <td>{d.cuenta?.tributo?.nombre || '-'}</td>
                          <td>{d.cuenta?.servicio?.nombre || '-'}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center">No hay detalles disponibles.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetalleReciboModal;
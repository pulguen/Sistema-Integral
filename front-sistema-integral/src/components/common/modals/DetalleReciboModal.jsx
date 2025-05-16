// src/features/facturacion/components/DetalleReciboModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Spinner, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch';

const DetalleReciboModal = ({ show, handleClose, recibo }) => {
  const [detalleRecibo, setDetalleRecibo] = useState(null);
  const [loading, setLoading] = useState(false);

const fetchDetalleRecibo = useCallback(async () => {
  setLoading(true);
  try {
    let clientName = 'N/A';

    if (recibo?.cliente?.clientable) {
      const c = recibo.cliente.clientable;
      clientName = `${c.nombre || ''} ${c.apellido || ''}`.trim();
    } else if (recibo.cliente_id) {
      const clientData = await customFetch(`/clientes/${recibo.cliente_id}`, 'GET');
      if (clientData && clientData.persona) {
        clientName = `${clientData.persona.nombre || ''} ${clientData.persona.apellido || ''}`.trim();
      }
    }

    let emitterName = 'N/A';
    if (recibo.emisor_id) {
      const emitterData = await customFetch(`/users/${recibo.emisor_id}`, 'GET');
      if (emitterData?.name) emitterName = emitterData.name;
    }

    let cashierName = 'N/A';
    if (recibo.cajero_id) {
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
    if (show) {
      fetchDetalleRecibo();
    }
  }, [show, fetchDetalleRecibo]);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle del Recibo</Modal.Title>
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
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>N° Recibo</th>
                  <th>Cliente</th>
                  <th>Fecha de Pago</th>
                  <th>Total</th>
                  <th>Emisor</th>
                  <th>Cajero</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{detalleRecibo.n_recibo}</td>
                  <td>{detalleRecibo.cliente_nombre}</td>
                  <td>{new Date(detalleRecibo.f_pago).toLocaleDateString()}</td>
                  <td>$ {detalleRecibo.i_total.toFixed(2)}</td>
                  <td>{detalleRecibo.emisor_nombre}</td>
                  <td>{detalleRecibo.cajero_nombre}</td>
                </tr>
              </tbody>
            </Table>
            <p><strong>Condición de Pago:</strong> {detalleRecibo.condicion_pago ? detalleRecibo.condicion_pago.nombre : 'N/A'}</p>
            <p><strong>Detalles:</strong></p>
            <ul>
              {detalleRecibo.detalles && detalleRecibo.detalles.length > 0 ? (
                detalleRecibo.detalles.map((d, index) => (
                  <li key={index}>
                    {d.mes}/{d.año} - Cuota: {d.cuota} - Importe: ${parseFloat(d.i_debito).toFixed(2)}
                  </li>
                ))
              ) : (
                <li>No hay detalles disponibles.</li>
              )}
            </ul>
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

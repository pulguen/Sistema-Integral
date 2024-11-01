import React, { useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import ReciboImprimible from '../../../features/facturacion/components/BombeoAgua/ReciboImprimible.jsx';
import '../../../styles/ReciboImprimible.css';

const ReciboImprimibleModal = ({ show, handleClose, recibo }) => {
  const handlePrint = useRef();

  return (
    <Modal className="a5-modal" show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Recibo Imprimible</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
        <ReciboImprimible recibo={recibo} handlePrint={handlePrint} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={() => handlePrint.current()}>
          Imprimir Recibo
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReciboImprimibleModal;
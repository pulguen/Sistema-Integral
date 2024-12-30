import React, { useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import ReciboImprimible from '../../../features/facturacion/components/BombeoAgua/ReciboImprimible.jsx';
import '../../../styles/ReciboImprimible.css';

const ReciboImprimibleModal = ({ show, handleClose, recibo }) => {
  const handlePrint = useRef();

  // Función para confirmar el cierre del modal
  const confirmClose = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Si cierras este recibo, no podrás volver a abrirlo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        handleClose();
      }
    });
  };

  return (
    <Modal 
      className="a5-modal" 
      show={show} 
      onHide={confirmClose} // Llama a confirmClose al intentar cerrar el modal
      centered 
      backdrop="static" // Evita el cierre al hacer clic fuera del modal
      keyboard={false}   // Evita el cierre al presionar la tecla Esc
    >
      <Modal.Header closeButton onHide={confirmClose}>
        <Modal.Title>Recibo Imprimible</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
        <ReciboImprimible recibo={recibo} handlePrint={handlePrint} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={confirmClose}>
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

// src/components/common/modals/EditReciboModal.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const EditReciboModal = ({ show, handleClose, recibo, handleSubmit }) => {
  const [formData, setFormData] = useState({
    i_debito: '',
    i_recargo: '',
    condicion_pago: '',
    // Otros campos que desees editar
  });

  useEffect(() => {
    if (recibo) {
      setFormData({
        i_debito: recibo.i_debito,
        i_recargo: recibo.i_recargo,
        condicion_pago: recibo.condicion_pago,
        // Otros campos
      });
    }
  }, [recibo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = () => {
    // Validar los datos antes de enviar
    if (!formData.condicion_pago) {
      Swal.fire('Error', 'La condición de pago es requerida.', 'error');
      return;
    }

    handleSubmit({ ...recibo, ...formData });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Recibo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="i_debito" className="mb-3">
            <Form.Label>Importe Débito</Form.Label>
            <Form.Control
              type="number"
              name="i_debito"
              value={formData.i_debito}
              onChange={handleChange}
              placeholder="Ingrese el importe de débito"
            />
          </Form.Group>
          <Form.Group controlId="i_recargo" className="mb-3">
            <Form.Label>Recargo</Form.Label>
            <Form.Control
              type="number"
              name="i_recargo"
              value={formData.i_recargo}
              onChange={handleChange}
              placeholder="Ingrese el recargo"
            />
          </Form.Group>
          <Form.Group controlId="condicion_pago" className="mb-3">
            <Form.Label>Condición de Pago</Form.Label>
            <Form.Control
              as="select"
              name="condicion_pago"
              value={formData.condicion_pago}
              onChange={handleChange}
            >
              <option value="">Seleccione una condición</option>
              <option value="Pagado">Pagado</option>
              <option value="Impago">Impago</option>
              {/* Agrega más opciones según tus necesidades */}
            </Form.Control>
          </Form.Group>
          {/* Agrega más campos según sea necesario */}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditReciboModal;

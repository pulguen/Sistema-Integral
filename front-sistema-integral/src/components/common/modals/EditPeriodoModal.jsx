// src/components/common/modals/EditPeriodoModal.jsx

import React, { useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditPeriodoModal = ({ show, handleClose, periodo, handleSubmit }) => {
  const nombreRef = useRef(null);
  
  useEffect(() => {
    if (show) {
      // Enfocar el primer campo al abrir el modal
      nombreRef.current?.focus();
    }
  }, [show]);

  const [formData, setFormData] = React.useState({
    mes: periodo?.mes || '',
    año: periodo?.año || '',
    cantidad: periodo?.cantidad || '',
    i_debito: periodo?.i_debito || '',
    i_descuento: periodo?.i_descuento || '',
    i_recargo_actualizado: periodo?.i_recargo_actualizado || '',
    condicion_pago: periodo?.condicion_pago || '',
    f_pago: periodo?.f_pago || '',
  });

  useEffect(() => {
    setFormData({
      mes: periodo?.mes || '',
      año: periodo?.año || '',
      cantidad: periodo?.cantidad || '',
      i_debito: periodo?.i_debito || '',
      i_descuento: periodo?.i_descuento || '',
      i_recargo_actualizado: periodo?.i_recargo_actualizado || '',
      condicion_pago: periodo?.condicion_pago || '',
      f_pago: periodo?.f_pago || '',
    });
  }, [periodo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit({ ...periodo, ...formData });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Período</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="mes" className="mb-3">
            <Form.Label>Mes</Form.Label>
            <Form.Control
              type="text"
              name="mes"
              value={formData.mes}
              onChange={handleChange}
              ref={nombreRef}
              required
            />
          </Form.Group>
          <Form.Group controlId="año" className="mb-3">
            <Form.Label>Año</Form.Label>
            <Form.Control
              type="number"
              name="año"
              value={formData.año}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="cantidad" className="mb-3">
            <Form.Label>Volumen</Form.Label>
            <Form.Control
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="i_debito" className="mb-3">
            <Form.Label>Importe</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="i_debito"
              value={formData.i_debito}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="i_descuento" className="mb-3">
            <Form.Label>Descuento</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="i_descuento"
              value={formData.i_descuento}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="i_recargo_actualizado" className="mb-3">
            <Form.Label>Recargo</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="i_recargo_actualizado"
              value={formData.i_recargo_actualizado}
              onChange={handleChange}
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
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="f_pago" className="mb-3">
            <Form.Label>Fecha de Pago</Form.Label>
            <Form.Control
              type="date"
              name="f_pago"
              value={formData.f_pago}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditPeriodoModal;

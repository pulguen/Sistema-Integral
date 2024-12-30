// src/components/common/modals/EditReciboModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditReciboModal = ({ show, handleClose, recibo, handleSubmit }) => {
  const [formData, setFormData] = useState({
    numero: '',
    mes: '',
    año: '',
    monto: '',
    descuento: '',
    recargo: '',
    f_emision: '',
    f_pago: '',
    estado: ''
  });

  useEffect(() => {
    if (recibo) {
      setFormData({
        numero: recibo.numero || '',
        mes: recibo.mes || '',
        año: recibo.año || '',
        monto: recibo.monto || '',
        descuento: recibo.descuento || '',
        recargo: recibo.recargo || '',
        f_emision: recibo.f_emision ? new Date(recibo.f_emision).toISOString().substr(0,10) : '',
        f_pago: recibo.f_pago ? new Date(recibo.f_pago).toISOString().substr(0,10) : '',
        estado: recibo.estado || ''
      });
    }
  }, [recibo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const updatedRecibo = {
      ...recibo,
      numero: formData.numero,
      mes: formData.mes,
      año: formData.año,
      monto: parseFloat(formData.monto),
      descuento: parseFloat(formData.descuento),
      recargo: parseFloat(formData.recargo),
      f_emision: formData.f_emision ? new Date(formData.f_emision) : null,
      f_pago: formData.f_pago ? new Date(formData.f_pago) : null,
      estado: formData.estado
    };

    await handleSubmit(updatedRecibo);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Recibo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          {/* Número */}
          <Form.Group className="mb-3" controlId="numero">
            <Form.Label>Número de Recibo</Form.Label>
            <Form.Control
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Mes */}
          <Form.Group className="mb-3" controlId="mes">
            <Form.Label>Mes</Form.Label>
            <Form.Control
              type="number"
              name="mes"
              value={formData.mes}
              onChange={handleChange}
              min="1"
              max="12"
              required
            />
          </Form.Group>

          {/* Año */}
          <Form.Group className="mb-3" controlId="año">
            <Form.Label>Año</Form.Label>
            <Form.Control
              type="number"
              name="año"
              value={formData.año}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Monto */}
          <Form.Group className="mb-3" controlId="monto">
            <Form.Label>Monto</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Descuento */}
          <Form.Group className="mb-3" controlId="descuento">
            <Form.Label>Descuento</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="descuento"
              value={formData.descuento}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Recargo */}
          <Form.Group className="mb-3" controlId="recargo">
            <Form.Label>Recargo</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="recargo"
              value={formData.recargo}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Fecha Emisión */}
          <Form.Group className="mb-3" controlId="f_emision">
            <Form.Label>Fecha de Emisión</Form.Label>
            <Form.Control
              type="date"
              name="f_emision"
              value={formData.f_emision}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Fecha Pago */}
          <Form.Group className="mb-3" controlId="f_pago">
            <Form.Label>Fecha de Pago</Form.Label>
            <Form.Control
              type="date"
              name="f_pago"
              value={formData.f_pago}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Estado */}
          <Form.Group className="mb-3" controlId="estado">
            <Form.Label>Estado</Form.Label>
            <Form.Control
              type="text"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditReciboModal;

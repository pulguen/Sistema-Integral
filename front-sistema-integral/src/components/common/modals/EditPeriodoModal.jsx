// src/components/common/modals/EditPeriodoModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

/**
 * Función auxiliar para extraer solo la parte yyyy-MM-dd
 * de una cadena ISO o similar que pueda venir con "T00:00:00"
 */
function toDateInputValue(isoString) {
  if (!isoString) return '';
  // Dividir por "T" y tomar la primera parte
  return isoString.split('T')[0]; // yyyy-MM-dd
}

const EditPeriodoModal = ({
  show,
  handleClose,
  periodo,
  handleSubmit,
  clientName // opcional: para mostrar el nombre del cliente
}) => {
  const nombreRef = useRef(null);

  // Estado local para el formulario
  const [formData, setFormData] = useState({
    mes: '',
    año: '',
    cantidad: '',
    cuota: '',
    f_vencimiento: ''
  });

  // Estado para validación del formulario
  const [validated, setValidated] = useState(false);

  // Estado para manejar errores específicos
  const [error, setError] = useState('');

  // Al mostrar el modal, enfocar el primer campo
  useEffect(() => {
    if (show) {
      nombreRef.current?.focus();
    }
  }, [show]);

  // Al cambiar "periodo", llenar los datos con lo recibido
  useEffect(() => {
    if (!periodo) return;

    setFormData({
      mes: periodo.mes || '',
      año: periodo.año || '',
      cantidad: periodo.cantidad || '',
      cuota: periodo.cuota || '', // Usando 'cuota' en lugar de 'i_debito'
      f_vencimiento: periodo.f_vencimiento ? toDateInputValue(periodo.f_vencimiento) : ''
    });
  }, [periodo]);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Limpiar mensajes de error al cambiar campos
    setError('');
  };

  // Al confirmar envío del formulario
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Verificar si el formulario es válido
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Preparar el payload para enviar
    const payload = {
      año: parseInt(formData.año, 10),
      mes: parseInt(formData.mes, 10),
      cant: parseFloat(formData.cantidad),
      cuota: parseFloat(formData.cuota),
      f_vencimiento: formData.f_vencimiento // 'yyyy-MM-dd'
    };

    // Validación adicional si es necesario
    // Puedes añadir más validaciones aquí si es necesario

    // Llamar a la función handleSubmit pasada como prop
    handleSubmit(payload);
    setValidated(false); // Resetear validación
    setError(''); // Resetear errores
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Form noValidate validated={validated} onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {/* Título con el nombre del cliente */}
            Editar Período {clientName ? `de ${clientName}` : ''}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Mostrar alerta de error si existe */}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Año */}
          <Form.Group controlId="año" className="mb-3">
            <Form.Label>Año</Form.Label>
            <Form.Control
              type="number"
              name="año"
              value={formData.año}
              onChange={handleChange}
              ref={nombreRef}
              required
              placeholder="Ingrese el año"
              min="1900"
              max="2100"
            />
            <Form.Control.Feedback type="invalid">
              Por favor, ingrese un año válido.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Mes */}
          <Form.Group controlId="mes" className="mb-3">
            <Form.Label>Mes</Form.Label>
            <Form.Control
              type="number"
              name="mes"
              value={formData.mes}
              onChange={handleChange}
              required
              placeholder="Ingrese el mes (1-12)"
              min="1"
              max="12"
            />
            <Form.Control.Feedback type="invalid">
              Por favor, ingrese un mes válido (1-12).
            </Form.Control.Feedback>
          </Form.Group>

          {/* Cantidad */}
          <Form.Group controlId="cantidad" className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              required
              placeholder="Ingrese la cantidad"
              min="0"
            />
            <Form.Control.Feedback type="invalid">
              Por favor, ingrese una cantidad válida.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Cuota */}
          <Form.Group controlId="cuota" className="mb-3">
            <Form.Label>Cuota</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="cuota"
              value={formData.cuota}
              onChange={handleChange}
              required
              placeholder="Ingrese la cuota"
              min="0"
            />
            <Form.Control.Feedback type="invalid">
              Por favor, ingrese una cuota válida.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Vencimiento */}
          <Form.Group controlId="f_vencimiento" className="mb-3">
            <Form.Label>Vencimiento</Form.Label>
            <Form.Control
              type="date"            // Calendario nativo
              name="f_vencimiento"
              value={formData.f_vencimiento}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Por favor, seleccione una fecha de vencimiento.
            </Form.Control.Feedback>
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

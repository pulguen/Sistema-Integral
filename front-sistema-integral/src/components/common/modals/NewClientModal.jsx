// src/components/common/modals/NewClientModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

export default function NewClientModal({ show, handleClose, handleSubmit }) {
  const [newClient, setNewClient] = useState({
    tipo_cliente: '',
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    altura: '',
    calle: '',
    f_nacimiento: '',
  });

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validar campos
  const validateFields = () => {
    const { tipo_cliente, nombre, apellido, dni, email, telefono, altura, calle, f_nacimiento } = newClient;

    if (
      !tipo_cliente ||
      !nombre ||
      (tipo_cliente === 'fisico' && !apellido) ||
      !dni ||
      !email ||
      !telefono ||
      !altura ||
      !calle ||
      !f_nacimiento
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor, completa todos los campos requeridos.',
      });
      return false;
    }

    // Validar email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido.',
      });
      return false;
    }

    // Validar DNI/CUIT
    if (!/^\d+$/.test(dni)) {
      Swal.fire({
        icon: 'error',
        title: 'DNI/CUIT inválido',
        text: 'El DNI/CUIT solo debe contener números.',
      });
      return false;
    }

    // Validar teléfono
    if (!/^\d+$/.test(telefono)) {
      Swal.fire({
        icon: 'error',
        title: 'Teléfono inválido',
        text: 'El teléfono solo debe contener números.',
      });
      return false;
    }

    // Validar altura
    if (isNaN(altura) || parseInt(altura, 10) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Altura inválida',
        text: 'La altura debe ser un número positivo.',
      });
      return false;
    }

    return true; // Campos válidos
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validar campos
    if (!validateFields()) return;

    try {
      // Confirmar antes de enviar
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Estás seguro de que quieres agregar este cliente?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, agregar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        // Llamar a la función de envío del cliente
        await handleSubmit(newClient);

        // Mostrar éxito
        await Swal.fire({
          icon: 'success',
          title: 'Cliente agregado',
          text: 'El cliente ha sido agregado exitosamente!',
        });

        // Reiniciar el formulario y cerrar el modal
        handleReset();
        handleClose();
      }
    } catch (error) {
      // Manejo de error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el cliente. Intenta nuevamente.',
      });
    }
  };

  const handleReset = () => {
    setNewClient({
      tipo_cliente: '',
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      altura: '',
      calle: '',
      f_nacimiento: '',
    });
  };

  // Función para manejar el cierre del modal y resetear el formulario
  const handleModalClose = () => {
    handleReset();
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          {/* Tipo de Cliente - Primer campo */}
          <Form.Group controlId="tipo_cliente" className="mb-3">
            <Form.Label className="font-weight-bold">
              Tipo de Cliente <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="select"
              name="tipo_cliente"
              value={newClient.tipo_cliente}
              onChange={handleChange}
              required
              className="rounded"
              aria-label="Seleccione el tipo de cliente"
            >
              <option value="">Seleccione el tipo de cliente</option>
              <option value="fisico">Físico</option>
              <option value="juridico">Jurídico</option>
            </Form.Control>
          </Form.Group>

          {/* Solo mostrar el resto del formulario si hay un tipo de cliente seleccionado */}
          {newClient.tipo_cliente && (
            <>
              {/* Nombre */}
              <Form.Group controlId="nombre" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Nombre <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={newClient.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre"
                  required
                  className="rounded"
                  aria-label="Ingrese el nombre del cliente"
                />
              </Form.Group>

              {/* Apellido - Condicional */}
              {newClient.tipo_cliente === 'fisico' && (
                <Form.Group controlId="apellido" className="mb-3">
                  <Form.Label className="font-weight-bold">
                    Apellido <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="apellido"
                    value={newClient.apellido}
                    onChange={handleChange}
                    placeholder="Ingrese el apellido"
                    required={newClient.tipo_cliente === 'fisico'}
                    className="rounded"
                    aria-label="Ingrese el apellido del cliente"
                  />
                </Form.Group>
              )}

              {/* DNI/CUIT */}
              <Form.Group controlId="dni" className="mb-3">
                <Form.Label className="font-weight-bold">
                  DNI/CUIT <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="dni"
                  value={newClient.dni}
                  onChange={handleChange}
                  placeholder="Ingrese el DNI o CUIT"
                  required
                  className="rounded"
                  aria-label="Ingrese el DNI o CUIT del cliente"
                />
              </Form.Group>

              {/* Email */}
              <Form.Group controlId="email" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={newClient.email}
                  onChange={handleChange}
                  placeholder="Ingrese el correo electrónico"
                  required
                  className="rounded"
                  aria-label="Ingrese el correo electrónico del cliente"
                />
              </Form.Group>

              {/* Teléfono */}
              <Form.Group controlId="telefono" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Teléfono <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={newClient.telefono}
                  onChange={handleChange}
                  placeholder="Ingrese el teléfono"
                  required
                  className="rounded"
                  aria-label="Ingrese el teléfono del cliente"
                />
              </Form.Group>

              {/* Calle */}
              <Form.Group controlId="calle" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Calle <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="calle"
                  value={newClient.calle}
                  onChange={handleChange}
                  placeholder="Ingrese la calle"
                  required
                  className="rounded"
                  aria-label="Ingrese la calle del cliente"
                />
              </Form.Group>

              {/* Altura */}
              <Form.Group controlId="altura" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Altura <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="altura"
                  value={newClient.altura}
                  onChange={handleChange}
                  placeholder="Ingrese la altura"
                  required
                  className="rounded"
                  aria-label="Ingrese la altura del cliente"
                />
              </Form.Group>

              {/* Fecha de Nacimiento */}
              <Form.Group controlId="f_nacimiento" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Fecha de Nacimiento <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="f_nacimiento"
                  value={newClient.f_nacimiento}
                  onChange={handleChange}
                  required
                  className="rounded"
                  aria-label="Seleccione la fecha de nacimiento del cliente"
                />
              </Form.Group>

              {/* Botones de Acción */}
              <div className="d-flex justify-content-end mt-4">
                <Button variant="secondary" onClick={handleModalClose} className="me-3">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Guardar Cliente
                </Button>
              </div>
            </>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
}

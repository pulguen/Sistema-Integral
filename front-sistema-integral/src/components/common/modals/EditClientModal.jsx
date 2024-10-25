import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

export default function EditClientModal({ show, handleClose, handleSubmit, clientData }) {
  const [client, setClient] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    tipo_cliente: 'fisico',
    altura: '',
    calle: '',
    f_nacimiento: '',
  });

  // Inicializamos los datos del cliente cuando el modal se abre
  useEffect(() => {
    if (clientData) {
      setClient({
        nombre: clientData.persona?.nombre || '',
        apellido: clientData.persona?.apellido || '',
        dni: clientData.persona?.dni || '',
        email: clientData.persona?.email || '',
        telefono: clientData.persona?.telefono || '',
        calle: clientData.persona?.calle || '',
        altura: clientData.persona?.altura || '',
        f_nacimiento: clientData.persona?.f_nacimiento || '',
        tipo_cliente: clientData.tipo_cliente || 'fisico',
      });
    }
  }, [clientData]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const confirmed = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro de que quieres modificar este cliente?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, modificar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmed.isConfirmed) {
      try {
        await handleSubmit({ ...client, id: clientData.id });
        Swal.fire({
          icon: 'success',
          title: 'Cliente modificado',
          text: 'El cliente ha sido modificado exitosamente!',
        });
        handleClose(); // Cierra el modal después de confirmar en SweetAlert
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo modificar el cliente. Intenta nuevamente.',
        });
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Modificar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={client.nombre}
              onChange={(e) => setClient({ ...client, nombre: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="apellido">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              value={client.apellido}
              onChange={(e) => setClient({ ...client, apellido: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="dni">
            <Form.Label>DNI</Form.Label>
            <Form.Control
              type="text"
              value={client.dni}
              onChange={(e) => setClient({ ...client, dni: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="telefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={client.telefono}
              onChange={(e) => setClient({ ...client, telefono: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="calle">
            <Form.Label>Calle</Form.Label>
            <Form.Control
              type="text"
              value={client.calle}
              onChange={(e) => setClient({ ...client, calle: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="altura">
            <Form.Label>Altura</Form.Label>
            <Form.Control
              type="number"
              value={client.altura}
              onChange={(e) => setClient({ ...client, altura: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="f_nacimiento">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control
              type="date"
              value={client.f_nacimiento}
              onChange={(e) => setClient({ ...client, f_nacimiento: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="tipo_cliente">
            <Form.Label>Tipo de Cliente</Form.Label>
            <Form.Control
              as="select"
              value={client.tipo_cliente}
              onChange={(e) => setClient({ ...client, tipo_cliente: e.target.value })}
              required
            >
              <option value="fisico">Físico</option>
              <option value="juridico">Jurídico</option>
            </Form.Control>
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-3">
            Guardar Cambios
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

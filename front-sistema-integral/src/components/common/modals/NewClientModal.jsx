import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

export default function NewClientModal({ show, handleClose, handleSubmit }) {
  const [newClient, setNewClient] = useState({
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

  const onSubmit = (e) => {
    e.preventDefault();

    // Mostrar SweetAlert para confirmar la acción
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro de que quieres agregar este cliente?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, agregar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, se ejecuta el proceso para agregar el cliente
        handleSubmit(newClient)
          .then(() => {
            // Mostrar SweetAlert de éxito si se agrega correctamente
            Swal.fire({
              icon: 'success',
              title: 'Cliente agregado',
              text: 'El cliente ha sido agregado exitosamente!',
            }).then(() => {
              // Reseteamos el formulario y cerramos el modal después de confirmar en SweetAlert
              setNewClient({
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
              handleClose(); // Cierra el modal
            });
          })
          .catch((error) => {
            // Mostrar SweetAlert de error si hay algún problema
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo agregar el cliente. Intenta nuevamente.',
            });
          });
      }
    });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={newClient.nombre}
              onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="apellido">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              value={newClient.apellido}
              onChange={(e) => setNewClient({ ...newClient, apellido: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="dni">
            <Form.Label>DNI</Form.Label>
            <Form.Control
              type="text"
              value={newClient.dni}
              onChange={(e) => setNewClient({ ...newClient, dni: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="telefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={newClient.telefono}
              onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="calle">
            <Form.Label>Calle</Form.Label>
            <Form.Control
              type="text"
              value={newClient.calle}
              onChange={(e) => setNewClient({ ...newClient, calle: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="altura">
            <Form.Label>Altura</Form.Label>
            <Form.Control
              type="number"
              value={newClient.altura}
              onChange={(e) => setNewClient({ ...newClient, altura: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="f_nacimiento">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control
              type="date"
              value={newClient.f_nacimiento}
              onChange={(e) => setNewClient({ ...newClient, f_nacimiento: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="tipo_cliente">
            <Form.Label>Tipo de Cliente</Form.Label>
            <Form.Control
              as="select"
              value={newClient.tipo_cliente}
              onChange={(e) => setNewClient({ ...newClient, tipo_cliente: e.target.value })}
              required
            >
              <option value="fisico">Físico</option>
              <option value="juridico">Jurídico</option>
            </Form.Control>
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">
            Guardar Cliente
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

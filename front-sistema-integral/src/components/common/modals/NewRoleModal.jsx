// src/features/Users/Components/modals/NewRoleModal.jsx

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';

export default function NewRoleModal({ show, handleClose, handleSubmit }) {
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRole((prevRole) => ({
      ...prevRole,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!newRole.name.trim()) {
      Swal.fire('Error', 'El nombre del rol es obligatorio.', 'error');
      return;
    }

    try {
      // Llamamos a handleSubmit pasado desde Roles.jsx
      await handleSubmit(newRole);
      // La función handleSubmit ya maneja los mensajes de éxito y el cierre del modal
      setNewRole({ name: '', description: '' });
      handleClose();
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al agregar el rol.', 'error');
      console.error('Error al agregar rol:', error);
    }
  };

  const handleModalClose = () => {
    setNewRole({ name: '', description: '' });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} backdrop="static" keyboard={false}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Rol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Campo de Nombre del Rol */}
          <Form.Group controlId="roleName">
            <Form.Label>Nombre del Rol</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={newRole.name}
              onChange={handleChange}
              placeholder="Ingrese el nombre del rol"
              required
              aria-label="Nombre del Rol"
            />
          </Form.Group>

          {/* Campo de Descripción del Rol */}
          <Form.Group controlId="roleDescription" className="mt-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={newRole.description}
              onChange={handleChange}
              rows={3}
              placeholder="Ingrese la descripción del rol"
              aria-label="Descripción del Rol"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {/* Botón para Cerrar el Modal */}
          <Button variant="secondary" onClick={handleModalClose} aria-label="Cancelar Agregar Rol">
            Cancelar
          </Button>
          {/* Botón para Enviar el Formulario */}
          <Button variant="primary" type="submit" aria-label="Guardar Nuevo Rol">
            Agregar Rol
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

NewRoleModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

// src/components/common/modals/EditRoleModal.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import { UsersContext } from '../../../context/UsersContext';

export default function EditRoleModal({ show, handleClose, roleData }) {
  const { editRole, fetchRoles } = useContext(UsersContext);

  const [updatedRole, setUpdatedRole] = useState({
    id: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    if (roleData && show) {
      setUpdatedRole({
        id: roleData.id,
        name: roleData.name || '',
        description: roleData.description || '',
      });
    }
  }, [roleData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedRole((prevRole) => ({
      ...prevRole,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validación básica: nombre obligatorio
    if (!updatedRole.name.trim()) {
      Swal.fire('Error', 'El nombre del rol es obligatorio.', 'error');
      return;
    }

    try {
      await editRole(updatedRole);
      // Llamamos a fetchRoles para actualizar la lista de roles
      await fetchRoles();
      Swal.fire('Éxito', 'Rol modificado exitosamente.', 'success');
      handleClose();
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al modificar el rol.', 'error');
      console.error('Error al modificar rol:', error);
    }
  };

  const handleModalClose = () => {
    setUpdatedRole({ id: '', name: '', description: '' });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} backdrop="static" keyboard={false}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Rol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="editRoleName">
            <Form.Label>Nombre del Rol</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={updatedRole.name}
              onChange={handleChange}
              placeholder="Ingrese el nombre del rol"
              required
              aria-label="Nombre del Rol"
            />
          </Form.Group>

          <Form.Group controlId="editRoleDescription" className="mt-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={updatedRole.description}
              onChange={handleChange}
              rows={3}
              placeholder="Ingrese la descripción del rol"
              aria-label="Descripción del Rol"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose} aria-label="Cancelar Edición Rol">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" aria-label="Guardar Cambios Rol">
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

EditRoleModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  roleData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
  }),
};

EditRoleModal.defaultProps = {
  roleData: null,
};

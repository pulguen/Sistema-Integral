// src/features/Users/Components/modals/UserRolesModal.jsx

import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default function UserRolesModal({
  show,
  handleClose,
  user,
  allRoles,
  onRolesUpdate,
  handleSave,
  userRoles,
  handleRoleChange,
  cargandoRoles,
}) {
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Asignar Roles a {user.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cargandoRoles ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Form>
            {allRoles.map((role) => (
              <Form.Check
                key={role.id}
                type="checkbox"
                id={`role-${role.id}`}
                label={role.name}
                checked={userRoles.includes(role.id)}
                onChange={() => handleRoleChange(role.id)}
              />
            ))}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={cargandoRoles}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={cargandoRoles || !user}
        >
          {cargandoRoles ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

UserRolesModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  allRoles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      description: PropTypes.string,
      guard_name: PropTypes.string,
      created_at: PropTypes.string,
      updated_at: PropTypes.string,
    })
  ).isRequired,
  onRolesUpdate: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.number).isRequired,
  handleRoleChange: PropTypes.func.isRequired,
  cargandoRoles: PropTypes.bool.isRequired,
};

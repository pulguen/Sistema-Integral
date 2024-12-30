import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

export default function EditUserModal({ show, handleClose, handleSubmit, userData }) {
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    isPasswordChanged: false,
  });

  useEffect(() => {
    if (userData && show) {
      const fullName = userData.name || '';
      const [nombre, ...apellidoParts] = fullName.split(' ');
      const apellido = apellidoParts.join(' ');

      setNewUser({
        nombre: nombre || '',
        apellido: apellido || '',
        email: userData.email || '',
        password: '',
        isPasswordChanged: false,
      });
    }
  }, [userData, show]);

  const validateFields = () => {
    if (!newUser.nombre || !newUser.apellido || !newUser.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor, completa todos los campos.',
      });
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newUser.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido.',
      });
      return false;
    }

    if (newUser.isPasswordChanged && newUser.password.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña inválida',
        text: 'La contraseña debe tener al menos 8 caracteres.',
      });
      return false;
    }

    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas guardar los cambios en este usuario?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        const payload = {
          id: userData.id,
          name: `${newUser.nombre} ${newUser.apellido}`.trim(),
          email: newUser.email,
        };

        if (newUser.isPasswordChanged) {
          payload.password = newUser.password;
        }

        await handleSubmit(payload);

        Swal.fire({
          icon: 'success',
          title: 'Usuario guardado',
          text: 'Los cambios se han guardado exitosamente.',
        });

        handleClose();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el usuario. Intenta nuevamente.',
      });
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={newUser.nombre}
              onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="apellido">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              value={newUser.apellido}
              onChange={(e) => setNewUser({ ...newUser, apellido: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Deja este campo vacío si no deseas cambiar la contraseña"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  password: e.target.value,
                  isPasswordChanged: true,
                })
              }
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-3">
            Guardar Cambios
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

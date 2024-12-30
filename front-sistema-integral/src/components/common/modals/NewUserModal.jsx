// src/features/Users/Components/modals/NewUserModal.jsx

import React, { useState, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { UsersContext } from '../../../context/UsersContext'; // Importar el contexto
import Swal from 'sweetalert2';

export default function NewUserModal({ show, handleClose }) {
  const { addUsuario } = useContext(UsersContext); // Consumir la función del contexto

  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validar campos
  const validateFields = () => {
    if (!newUser.nombre || !newUser.apellido || !newUser.email || !newUser.password || !newUser.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor, completa todos los campos.',
      });
      return false;
    }

    // Validar email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newUser.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido.',
      });
      return false;
    }

    // Validar contraseña
    if (newUser.password.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña inválida',
        text: 'La contraseña debe tener al menos 8 caracteres.',
      });
      return false;
    }

    // Validar que las contraseñas coincidan
    if (newUser.password !== newUser.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseñas no coinciden',
        text: 'Por favor, asegúrate de que ambas contraseñas sean iguales.',
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
        text: '¿Estás seguro de que quieres agregar este usuario?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, agregar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        // Concatenar nombre completo
        const fullName = `${newUser.nombre} ${newUser.apellido}`;
        const payload = {
          name: fullName,
          email: newUser.email,
          password: newUser.password,
        };

        await addUsuario(payload); // Usar la función del contexto

        Swal.fire({
          icon: 'success',
          title: 'Usuario agregado',
          text: 'El usuario ha sido agregado exitosamente!',
        });

        // Reiniciar el formulario y cerrar el modal
        setNewUser({
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        handleClose();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el usuario. Intenta nuevamente.',
      });
    }
  };

  const handleModalClose = () => {
    setNewUser({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} backdrop="static" keyboard={false}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={newUser.nombre}
              onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
              required
              aria-label="Nombre"
            />
          </Form.Group>

          <Form.Group controlId="apellido" className="mt-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              value={newUser.apellido}
              onChange={(e) => setNewUser({ ...newUser, apellido: e.target.value })}
              required
              aria-label="Apellido"
            />
          </Form.Group>

          <Form.Group controlId="email" className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
              aria-label="Email"
            />
          </Form.Group>

          <Form.Group controlId="password" className="mt-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
              aria-label="Contraseña"
              placeholder="Ingrese una contraseña de al menos 8 caracteres"
            />
          </Form.Group>

          <Form.Group controlId="confirmPassword" className="mt-3">
            <Form.Label>Confirmar Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={newUser.confirmPassword}
              onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
              required
              aria-label="Confirmar Contraseña"
              placeholder="Confirme la contraseña"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose} aria-label="Cancelar Agregar Usuario">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" aria-label="Guardar Usuario">
            Guardar Usuario
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

// ForgotPasswordModal.jsx
import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import customFetch from '../../../context/CustomFetch.js';
import Swal from 'sweetalert2';

function ForgotPasswordModal({ show, handleClose }) {
  const [email, setEmail] = useState('');
  const [userVerified, setUserVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Primer paso: Verificar que el correo exista
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      // Se realiza la consulta a la API para verificar si existe el email.
      const data = await customFetch(`/users?email=${email}`, 'GET');
      if (data && Array.isArray(data) && data.length > 0) {
        setUserVerified(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Email no registrado',
          text: 'El correo ingresado no se encuentra registrado.',
        });
      }
    } catch (error) {
      // Los errores se muestran desde customFetch.
    }
  };

  // Segundo paso: Enviar la nueva contraseña a la API.
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña corta',
        text: 'La contraseña debe tener al menos 8 caracteres.',
      });
      return;
    }
    if (newPassword !== passwordConfirm) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseñas no coinciden',
        text: 'La confirmación de la contraseña no coincide.',
      });
      return;
    }
    try {
      await customFetch(
        '/users/password/modificar',
        'POST',
        {
          password: newPassword,
          password_confirmation: passwordConfirm,
        }
      );
      Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Tu contraseña ha sido actualizada correctamente.',
      });
      // Reiniciamos estados y cerramos el modal.
      resetModalState();
      handleClose();
    } catch (error) {
      // Los errores se manejan desde customFetch.
    }
  };

  const resetModalState = () => {
    setEmail('');
    setUserVerified(false);
    setNewPassword('');
    setPasswordConfirm('');
  };

  const closeModal = () => {
    resetModalState();
    handleClose();
  };

  return (
    <Modal show={show} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Recuperar contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!userVerified ? (
          // Formulario para ingresar y verificar el correo.
          <Form onSubmit={handleEmailSubmit}>
            <Form.Group controlId="forgotEmail">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Ingresa tu correo" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Verificar correo
            </Button>
          </Form>
        ) : (
          // Formulario para actualizar la contraseña.
          <Form onSubmit={handlePasswordReset}>
            <Form.Group controlId="newPassword">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Ingresa tu nueva contraseña" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="confirmPassword" className="mt-3">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Confirma tu contraseña" 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Actualizar Contraseña
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ForgotPasswordModal;

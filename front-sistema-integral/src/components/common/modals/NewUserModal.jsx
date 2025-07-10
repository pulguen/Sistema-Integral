import React, { useState, useContext } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { UsersContext } from '../../../context/UsersContext';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { passwordConditions, getPasswordFails } from '../../../utils/passwordValidation';

export default function NewUserModal({ show, handleClose }) {
  const { addUsuario } = useContext(UsersContext);

  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const validate = () => {
    let err = {};
    if (!newUser.nombre) err.nombre = 'El nombre es obligatorio.';
    if (!newUser.apellido) err.apellido = 'El apellido es obligatorio.';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.email) err.email = 'El email es obligatorio.';
    else if (!emailPattern.test(newUser.email)) err.email = 'Formato de email inválido.';

    const fails = getPasswordFails(newUser.password);
    if (!newUser.password) err.password = 'La contraseña es obligatoria.';
    else if (fails.length > 0) err.password = 'No cumple los requisitos de seguridad.';

    if (!newUser.confirmPassword) err.confirmPassword = 'Confirmá la contraseña.';
    else if (newUser.password !== newUser.confirmPassword)
      err.confirmPassword = 'Las contraseñas no coinciden.';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas agregar este usuario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, agregar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        setSaving(true);
        const fullName = `${newUser.nombre} ${newUser.apellido}`.trim();
        const payload = {
          name: fullName,
          email: newUser.email,
          password: newUser.password,
        };

        await addUsuario(payload);

        Swal.fire({
          icon: 'success',
          title: 'Usuario agregado',
          text: 'El usuario ha sido agregado exitosamente!',
        });

        setNewUser({
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setErrors({});
        setTouchedPassword(false);
        setShowPassword(false);
        setShowConfirm(false);
        handleClose();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el usuario. Intenta nuevamente.',
      });
    } finally {
      setSaving(false);
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
    setErrors({});
    setTouchedPassword(false);
    setShowPassword(false);
    setShowConfirm(false);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} backdrop="static" keyboard={false} centered>
      <Form onSubmit={onSubmit} autoComplete="off">
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
              isInvalid={!!errors.nombre}
              required
              aria-label="Nombre"
              disabled={saving}
            />
            <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="apellido" className="mt-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              value={newUser.apellido}
              onChange={(e) => setNewUser({ ...newUser, apellido: e.target.value })}
              isInvalid={!!errors.apellido}
              required
              aria-label="Apellido"
              disabled={saving}
            />
            <Form.Control.Feedback type="invalid">{errors.apellido}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="email" className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              isInvalid={!!errors.email}
              required
              aria-label="Email"
              disabled={saving}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="password" className="mt-3">
            <Form.Label>Contraseña</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) => {
                  setNewUser({ ...newUser, password: e.target.value });
                  setTouchedPassword(true);
                }}
                onBlur={() => setTouchedPassword(true)}
                isInvalid={!!errors.password}
                required
                aria-label="Contraseña"
                placeholder="Clave segura"
                minLength={8}
                autoComplete="new-password"
                disabled={saving}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{ borderLeft: 0 }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
            {/* Checklist visual */}
            {(touchedPassword || newUser.password) && (
              <div className="mt-2">
                <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.97em' }}>
                  {passwordConditions.map(cond => {
                    const ok = cond.test(newUser.password);
                    return (
                      <li key={cond.key} style={{ color: ok ? 'green' : 'red' }}>
                        {ok ? '✔️' : '❌'} {cond.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="confirmPassword" className="mt-3">
            <Form.Label>Confirmar Contraseña</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirm ? "text" : "password"}
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                isInvalid={!!errors.confirmPassword}
                required
                aria-label="Confirmar Contraseña"
                placeholder="Repetí la contraseña"
                minLength={8}
                autoComplete="new-password"
                disabled={saving}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{ borderLeft: 0 }}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
            <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleModalClose}
            aria-label="Cancelar Agregar Usuario"
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            aria-label="Guardar Usuario"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar Usuario"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

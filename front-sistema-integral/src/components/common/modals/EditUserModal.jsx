import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { passwordConditions, getPasswordFails } from '../../../utils/passwordValidation';

export default function EditUserModal({ show, handleClose, handleSubmit, userData }) {
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        confirmPassword: '',
      });
      setShowPasswordFields(false);
      setErrors({});
      setTouchedPassword(false);
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [userData, show]);

  const validate = () => {
    let err = {};
    if (!newUser.nombre) err.nombre = 'El nombre es obligatorio.';
    if (!newUser.apellido) err.apellido = 'El apellido es obligatorio.';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.email) {
      err.email = 'El email es obligatorio.';
    } else if (!emailPattern.test(newUser.email)) {
      err.email = 'Formato de email inválido.';
    }

    if (showPasswordFields) {
      const fails = getPasswordFails(newUser.password);
      if (!newUser.password) err.password = 'La contraseña es obligatoria.';
      else if (fails.length > 0) err.password = 'No cumple los requisitos de seguridad.';
      if (!newUser.confirmPassword) err.confirmPassword = 'Confirmá la contraseña.';
      else if (newUser.password !== newUser.confirmPassword)
        err.confirmPassword = 'Las contraseñas no coinciden.';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const nombreCompletoNuevo = `${newUser.nombre} ${newUser.apellido}`.trim();
    const nombreCompletoActual = (userData.name || '').trim();
    const datosCambiaron =
      nombreCompletoNuevo !== nombreCompletoActual ||
      newUser.email !== userData.email;
    const passwordCambiada = showPasswordFields && newUser.password.length > 0;

    if (!datosCambiaron && !passwordCambiada) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No hay cambios para guardar.',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Guardar cambios?',
      text: '¿Deseas guardar los cambios realizados?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    setSaving(true);

    try {
      // Guardar datos personales
      if (datosCambiaron) {
        await handleSubmit({
          id: userData.id,
          name: nombreCompletoNuevo,
          email: newUser.email,
        });
      }

      // Cambiar contraseña (CORREGIDO: agregando user_id)
      if (passwordCambiada) {
        await customFetch('/users/password/modificar', 'POST', {
          password: newUser.password,
          password_confirmation: newUser.confirmPassword,
          user_id: userData.id,
        });
      }

      let msg = '';
      if (datosCambiaron && passwordCambiada) {
        msg = 'Datos y contraseña actualizados correctamente.';
      } else if (datosCambiaron) {
        msg = 'Datos actualizados correctamente.';
      } else if (passwordCambiada) {
        msg = 'Contraseña actualizada correctamente.';
      }
      Swal.fire({ icon: 'success', title: 'Éxito', text: msg });
      handleClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'No se pudo guardar el usuario. Intenta nuevamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={saving ? undefined : handleClose} centered>
      <Modal.Header closeButton={!saving}>
        <Modal.Title>Editar Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={onSubmit} autoComplete="off">
          <h5 className="mb-3">Datos personales</h5>
          <Row>
            <Col>
              <Form.Group controlId="nombre" className="mb-2">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={newUser.nombre}
                  onChange={(e) =>
                    setNewUser({ ...newUser, nombre: e.target.value })
                  }
                  isInvalid={!!errors.nombre}
                  disabled={saving}
                  autoComplete="given-name"
                  placeholder="Nombre"
                  aria-label="Nombre"
                />
                <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="apellido" className="mb-2">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  value={newUser.apellido}
                  onChange={(e) =>
                    setNewUser({ ...newUser, apellido: e.target.value })
                  }
                  isInvalid={!!errors.apellido}
                  disabled={saving}
                  autoComplete="family-name"
                  placeholder="Apellido"
                  aria-label="Apellido"
                />
                <Form.Control.Feedback type="invalid">{errors.apellido}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group controlId="email" className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              isInvalid={!!errors.email}
              disabled={saving}
              autoComplete="email"
              placeholder="ejemplo@correo.com"
              aria-label="Correo electrónico"
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <hr className="my-4" />
          <h5 className="mb-3">Seguridad</h5>

          {!showPasswordFields && (
            <Button
              variant="outline-secondary"
              className="mb-2"
              onClick={() => setShowPasswordFields(true)}
              disabled={saving}
            >
              Cambiar contraseña
            </Button>
          )}

          {showPasswordFields && (
            <>
              <Form.Group controlId="password" className="mb-2">
                <Form.Label>Nueva Contraseña</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={e => {
                      setNewUser({ ...newUser, password: e.target.value });
                      setTouchedPassword(true);
                    }}
                    isInvalid={!!errors.password}
                    autoComplete="new-password"
                    placeholder="Clave segura"
                    aria-label="Nueva contraseña"
                    minLength={8}
                    disabled={saving}
                    onBlur={() => setTouchedPassword(true)}
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
              <Form.Group controlId="confirmPassword" className="mb-2">
                <Form.Label>Confirmar contraseña</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirm ? "text" : "password"}
                    value={newUser.confirmPassword}
                    onChange={e =>
                      setNewUser({ ...newUser, confirmPassword: e.target.value })
                    }
                    isInvalid={!!errors.confirmPassword}
                    autoComplete="new-password"
                    placeholder="Repetir contraseña"
                    aria-label="Confirmar contraseña"
                    minLength={8}
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
              <Button
                variant="link"
                className="ps-0"
                onClick={() => {
                  setShowPasswordFields(false);
                  setNewUser({
                    ...newUser,
                    password: '',
                    confirmPassword: '',
                  });
                  setTouchedPassword(false);
                  setShowPassword(false);
                  setShowConfirm(false);
                  setErrors(e => ({
                    ...e,
                    password: undefined,
                    confirmPassword: undefined
                  }));
                }}
                disabled={saving}
                style={{ fontSize: "0.95em" }}
              >
                Cancelar cambio de contraseña
              </Button>
            </>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={saving}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  /> Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

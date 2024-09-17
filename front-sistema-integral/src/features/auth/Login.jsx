// src/features/auth/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0); // Intentos fallidos

  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');  // Redirigir a la página de inicio si ya está logueado
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limitar intentos de login
    if (loginAttempts >= 3) {
      Swal.fire({
        icon: 'error',
        title: 'Demasiados intentos',
        text: 'Has superado el número de intentos permitidos. Inténtalo de nuevo en 5 minutos.',
      });
      return;
    }

    // Validación de campos vacíos
    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor, completa todos los campos.',
      });
      return;
    }

    // Validar formato del correo electrónico
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido.',
      });
      return;
    }

    // Validar que la contraseña tenga al menos 8 caracteres
    if (password.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña inválida',
        text: 'La contraseña debe tener al menos 8 caracteres.',
      });
      return;
    }

    // Intentar el login
    try {
      const success = await login(email, password);
      if (!success) {
        setLoginAttempts(prev => prev + 1); // Aumentar intentos fallidos
        Swal.fire({
          icon: 'error',
          title: 'Datos incorrectos',
          text: 'El correo o la contraseña son incorrectos.',
        });
      } else {
        setLoginAttempts(0); // Reiniciar intentos si el login es exitoso
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'Hubo un problema al iniciar sesión. Verifica tu conexión a internet.',
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h1 className="text-center mb-4 mt-4">Inicio de Sesión</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Contraseña</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={togglePasswordVisibility}
                  style={{ borderLeft: 'none' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRememberUser">
              <Form.Check
                type="checkbox"
                label="Recordame"
                checked={rememberUser}
                onChange={(e) => setRememberUser(e.target.checked)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-3">
              Ingresar
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

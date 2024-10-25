// LoginForm.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Form, Container, Row, Col, InputGroup, Button } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer/Footer';
import CustomButton from '../../components/common/botons/CustomButton.jsx';

export default function LoginForm() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirigir a la página de inicio si ya está logueado
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginAttempts >= 3) {
      Swal.fire({
        icon: 'error',
        title: 'Demasiados intentos',
        text: 'Has superado el número de intentos permitidos. Inténtalo de nuevo en 5 minutos.',
      });
      return;
    }

    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor, completa todos los campos.',
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido.',
      });
      return;
    }

    if (password.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña inválida',
        text: 'La contraseña debe tener al menos 8 caracteres.',
      });
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) {
        setLoginAttempts((prev) => prev + 1);
      } else {
        setLoginAttempts(0);
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
    <>
      <Container className="mt-5 mb-5">
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
                  <CustomButton
                    variant="secondary"
                    onClick={togglePasswordVisibility}
                    style={{ borderLeft: 'none' }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </CustomButton>
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

              <CustomButton type="submit" className="w-100 mb-3 primary">
                Ingresar
              </CustomButton>

              <div className="d-flex justify-content-between mb-4">
                <Button
                  variant="link"
                  className="p-0"
                  style={{
                    fontSize: '14px',
                    textDecoration: 'none',
                    color: 'var(--secundary-color)',
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
                <Button
                  variant="link"
                  className="p-0"
                  style={{
                    fontSize: '14px',
                    textDecoration: 'none',
                    color: 'var(--secundary-color)',
                  }}
                >
                  ¿Necesitás ayuda?
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>

      <Footer />
    </>
  );
}

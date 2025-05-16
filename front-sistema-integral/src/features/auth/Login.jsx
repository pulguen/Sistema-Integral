import React, { useState, useContext, useEffect } from 'react';
import {
  Form, Container, Row, Col, InputGroup, Button, Spinner, Card, Alert, OverlayTrigger, Tooltip,
} from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer/Footer';
import CustomButton from '../../components/common/botons/CustomButton.jsx';
import ForgotPasswordModal from '../../components/common/modals/ForgotPasswordModal.jsx';
import { motion } from 'framer-motion';

export default function LoginForm() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (loginAttempts >= 3) {
      setErrorMessage('Has superado el número de intentos permitidos. Inténtalo de nuevo en 5 minutos.');
      return;
    }

    if (!email || !password) {
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setLoginAttempts((prev) => prev + 1);
        setErrorMessage('Correo o contraseña incorrectos.');
      } else {
        setLoginAttempts(0);
      }
    } catch {
      setErrorMessage('Error al conectar. Verifica tu conexión a internet.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <>
      <Container className="mt-5 mb-5">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={6} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow p-4 rounded-4 border-0">
                <div className="d-flex flex-column align-items-center mb-3">
                  <img
                    src="/EscudoZapala.png"
                    alt="Escudo Zapala"
                    style={{
                      width: '90px',
                      height: 'auto',
                      marginBottom: '10px',
                    }}
                  />
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--secundary-color)', fontWeight: '600' }}>
                    Bienvenido 👋
                  </h2>
                  <h5 style={{ fontSize: '1rem', color: 'var(--dark-color)', fontWeight: '400' }}>
                    Sistema Integral Municipalidad de Zapala
                  </h5>
                </div>

                {errorMessage && (
                  <Alert variant="danger" className="text-center">
                    {errorMessage}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Contraseña</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><FaLock /></InputGroup.Text>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Mostrar/Ocultar contraseña</Tooltip>}
                      >
                        <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </OverlayTrigger>
                    </InputGroup>
                    <Form.Text className="text-muted">Debe tener al menos 8 caracteres.</Form.Text>
                  </Form.Group>

                  <CustomButton type="submit" className="w-100 mb-3 primary" disabled={isLoggingIn}>
                    {isLoggingIn ? (
                      <>
                        <Spinner animation="border" size="sm" role="status" className="me-2" />
                        Iniciando...
                      </>
                    ) : (
                      'Ingresar'
                    )}
                  </CustomButton>

                  <div className="d-flex justify-content-between">
                    <Button
                      variant="link"
                      className="p-0"
                      style={{ fontSize: '14px', color: 'var(--secundary-color)', textDecoration: 'none' }}
                      onClick={() => setShowForgotModal(true)}
                    >
                      ¿Olvidaste tu contraseña?
                    </Button>
                    <Button
                      variant="link"
                      className="p-0"
                      style={{ fontSize: '14px', color: 'var(--secundary-color)', textDecoration: 'none' }}
                    >
                      ¿Necesitás ayuda?
                    </Button>
                  </div>
                </Form>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>

      <ForgotPasswordModal show={showForgotModal} handleClose={() => setShowForgotModal(false)} />
      <Footer />
    </>
  );
}

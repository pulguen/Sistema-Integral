import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';
import '../../styles/Unauthorized.css';

export default function Unauthorized() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container className="unauthorized-container text-center mt-5">
      <h2 className="mb-4">Acceso Denegado</h2>
      <p>No tienes permiso para acceder a esta página.</p>
      <Button variant="primary" onClick={handleGoHome}>
        Volver al Home
      </Button>
    </Container>
  );
}

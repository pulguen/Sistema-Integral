import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';
import '../../styles/Unauthorized.css';

export default function Unauthorized() {
  return (
    <Container className="unauthorized-container text-center mt-5">
      <h2 className="mb-4">Acceso Denegado</h2>
      <p>No tienes permiso para acceder a esta página.</p>
      <Button as={Link} to="/" variant="primary">
        Volver al Home
      </Button>
    </Container>
  );
}

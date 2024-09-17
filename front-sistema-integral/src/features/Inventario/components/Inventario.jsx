// src/features/inventario/components/Inventario.jsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Inventario = () => {
  return (
    <Container fluid>
      <Row>
        {/* Contenido principal de Inventario */}
        <Col md={12}>
          <h2>Bienvenido al Sistema de Inventario</h2>
          {/* Aquí puedes añadir el contenido específico de inventario */}
        </Col>
      </Row>
    </Container>
  );
};

export default Inventario;

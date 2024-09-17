// src/features/facturacion/components/Facturacion.jsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Facturacion = () => {
  return (
    <Container fluid>
      <Row>
        {/* Contenido principal de Facturación */}
        <Col md={12}>
          <h2>Bienvenido al Sistema de Facturación</h2>
          {/* Aquí puedes añadir el contenido específico de facturación */}
        </Col>
      </Row>
    </Container>
  );
};

export default Facturacion;

import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Home = () => {
  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Bienvenido al Sistema</h2>

      <Row className="justify-content-center">
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Sistema de Facturación</Card.Title>
              <Card.Text>Administra tus facturas y genera nuevas transacciones.</Card.Text>
              <Button variant="primary" href="/facturacion">Ir a Facturación</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Sistema de Inventario</Card.Title>
              <Card.Text>Gestiona el stock y tus productos disponibles.</Card.Text>
              <Button variant="success" href="/inventario">Ir a Inventario</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Sistema de Recursos Humanos</Card.Title>
              <Card.Text>Controla la información de tus empleados y nómina.</Card.Text>
              <Button variant="warning" href="/recursos-humanos">Ir a Recursos Humanos</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;

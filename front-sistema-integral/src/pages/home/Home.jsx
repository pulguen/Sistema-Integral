// src/pages/home/Home.jsx
import React from 'react';
import { Container, Row } from 'react-bootstrap';
import CommonCard from '../../components/common/Cards/Cards'; // Ajusta la ruta según tu estructura

const Home = () => {

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Bienvenido al Sistema Integral de la Municipalidad de Zapala</h2>

      <Row className="justify-content-center">
        <CommonCard
          title="Sistema de Facturación"
          description="Administra tus facturas y genera nuevas transacciones."
          buttonText="Ir a Facturación"
          route="/facturacion"
          variant="primary"
        />

        <CommonCard
          title="Sistema de Inventario"
          description="Gestiona el stock y tus productos disponibles."
          buttonText="Ir a Inventario"
          route="/inventario"
          variant="success"
        />

        <CommonCard
          title="Sistema de Recursos Humanos"
          description="Controla la información de tus empleados y nómina."
          buttonText="Ir a Recursos Humanos"
          route="/recursos-humanos"
          variant="warning"
        />

        <CommonCard
          title="Sistema de Usuarios"
          description="Controla la información de tus usuarios y permisos."
          buttonText="Ir a Usuarios"
          route="/usuarios"
          variant="info"
        />

        {/* Nueva Card para el subsistema de caja */}
        <CommonCard
          title="Sistema de Caja"
          description="Registra los movimientos de caja y administra todos los medios de pago disponibles."
          buttonText="Ir a Caja"
          route="/caja"
          variant="dark"
        />
      </Row>
    </Container>
  );
};

export default Home;

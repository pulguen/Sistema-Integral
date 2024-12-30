// src/features/facturacion/components/HomeFacturacion/HomeFacturacion.jsx
import React from "react";
import { Breadcrumb, Container, Row } from "react-bootstrap"; 
import { Link } from "react-router-dom";
import CommonCard from "../../../../components/common/Cards/Cards";

const FacturacionHome = () => {
  return (
    <div>
      {/* Migas de Pan */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/facturacion" }}>
          Facturación
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          Home Facturación
        </Breadcrumb.Item>
      </Breadcrumb>
      
      <h2 className="text-center mb-4 text-primary">Facturación</h2>

      {/* Sección de Tarjetas */}
      <Container className="mt-5">
        <Row className="justify-content-center">
          <CommonCard
            title="Alquiler Terminal"
            description="Gestiona el alquiler de terminales, controla contratos y realiza seguimiento de pagos."
            buttonText="Ir a Alquiler Terminal"
            route="/facturacion/alquiler-terminal"
            variant="primary"
          />

          <CommonCard
            title="Bombeo de Agua Bosque Comunal"
            description="Administra los servicios de bombeo de agua, monitorea consumos y genera facturas específicas."
            buttonText="Ir a Bombeo de Agua"
            route="/facturacion/bombeo-agua"
            variant="success"
          />

          <CommonCard
            title="Horno Pirolítico"
            description="Controla el uso del horno pirolítico, programa mantenimientos y gestiona las facturaciones asociadas."
            buttonText="Ir a Horno Pirolítico"
            route="/facturacion/horno-pirolitico"
            variant="warning"
          />

          <CommonCard
            title="Gestión de Clientes"
            description="Administra la información de tus clientes, gestiona contratos y realiza seguimiento de pagos."
            buttonText="Ir a Gestión de Clientes"
            route="/facturacion/gestion-clientes"
            variant="info"
          />

          <CommonCard
            title="Periodos de Facturación"
            description="Configura y gestiona los periodos de facturación, establece fechas de corte y ciclos de pago."
            buttonText="Ir a Periodos de Facturación"
            route="/facturacion/periodos"
            variant="dark"
          />
        </Row>
      </Container>
    </div>
  );
};

export default FacturacionHome;

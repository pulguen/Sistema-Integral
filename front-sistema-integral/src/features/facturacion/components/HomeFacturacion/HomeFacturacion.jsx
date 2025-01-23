import React, { useContext } from "react";
import { Breadcrumb, Container, Row } from "react-bootstrap"; 
import { Link } from "react-router-dom";
import CommonCard from "../../../../components/common/Cards/Cards";
import { AuthContext } from "../../../../context/AuthContext"; // Importar el AuthContext para usar los permisos

const FacturacionHome = () => {
  const { user } = useContext(AuthContext); // Obtener los permisos del usuario

  // Función para verificar los permisos
  const hasAccess = (permission) => user.permissions.includes(permission);

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
          {hasAccess('alquilerterminal.access') && (
            <CommonCard
              title="Alquiler Terminal"
              description="Gestiona el alquiler de terminales, controla contratos y realiza seguimiento de pagos."
              buttonText="Ir a Alquiler Terminal"
              route="/facturacion/alquiler-terminal"
              variant="primary"
            />
          )}

          {hasAccess('bombeoagua.access') && (
            <CommonCard
              title="Bombeo de Agua Bosque Comunal"
              description="Administra los servicios de bombeo de agua, monitorea consumos y genera facturas específicas."
              buttonText="Ir a Bombeo de Agua"
              route="/facturacion/bombeo-agua"
              variant="success"
            />
          )}

          {hasAccess('hornopirolitico.access') && (
            <CommonCard
              title="Horno Pirolítico"
              description="Controla el uso del horno pirolítico, programa mantenimientos y gestiona las facturaciones asociadas."
              buttonText="Ir a Horno Pirolítico"
              route="/facturacion/horno-pirolitico"
              variant="warning"
            />
          )}

          {hasAccess('clientes.index') && (
            <CommonCard
              title="Gestión de Clientes"
              description="Administra la información de tus clientes, gestiona contratos y realiza seguimiento de pagos."
              buttonText="Ir a Gestión de Clientes"
              route="/facturacion/clientes"
              variant="info"
            />
          )}

          {hasAccess('cuentas.index') && (
            <CommonCard
              title="Periodos de Facturación"
              description="Configura y gestiona los periodos de facturación, establece fechas de corte y ciclos de pago."
              buttonText="Ir a Periodos de Facturación"
              route="/facturacion/periodos"
              variant="dark"
            />
          )}

          {hasAccess('recibos.index') && (
            <CommonCard
              title="Recibos de Facturación"
              description="Visualiza y gestiona los recibos de pago de los clientes."
              buttonText="Ir a Recibos de Facturación"
              route="/facturacion/recibos"
              variant="secondary"
            />
          )}
        </Row>
      </Container>
    </div>
  );
};

export default FacturacionHome;

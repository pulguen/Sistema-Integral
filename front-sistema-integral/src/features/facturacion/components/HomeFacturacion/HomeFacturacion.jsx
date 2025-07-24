import React, { useContext, useState } from "react";
import { Breadcrumb, Container, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import CommonCard from "../../../../components/common/Cards/Cards";
import { AuthContext } from "../../../../context/AuthContext";

const facturacionModules = [
  {
    key: 'alquilerplataforma',
    permission: 'alquilerplataforma.access',
    title: "Alquiler Plataforma",
    description: "Gestiona el alquiler de Plataformas, controla contratos y realiza seguimiento de pagos.",
    buttonText: "Ir a Alquiler Plataforma",
    route: "/facturacion/alquiler-plataforma",
    variant: "primary",
  },
  {
    key: 'bombeoagua',
    permission: 'bombeoagua.access',
    title: "Bombeo de Agua Bosque Comunal",
    description: "Administra los servicios de bombeo de agua, monitorea consumos y genera facturas específicas.",
    buttonText: "Ir a Bombeo de Agua",
    route: "/facturacion/bombeo-agua",
    variant: "primary",
  },
  {
    key: 'hornopirolitico',
    permission: 'hornopirolitico.access',
    title: "Horno Pirolítico",
    description: "Controla el uso del horno pirolítico, programa mantenimientos y gestiona las facturaciones asociadas.",
    buttonText: "Ir a Horno Pirolítico",
    route: "/facturacion/horno-pirolitico",
    variant: "primary",
  },
  {
    key: 'clientes',
    permission: 'clientes.index',
    title: "Gestión de Clientes",
    description: "Administra la información de tus clientes, gestiona contratos y realiza seguimiento de pagos.",
    buttonText: "Ir a Gestión de Clientes",
    route: "/facturacion/clientes",
    variant: "primary",
  },
  {
    key: 'periodos',
    permission: 'cuentas.index',
    title: "Periodos de Facturación",
    description: "Configura y gestiona los periodos de facturación, establece fechas de corte y ciclos de pago.",
    buttonText: "Ir a Periodos de Facturación",
    route: "/facturacion/periodos",
    variant: "primary",
  },
  {
    key: 'recibos',
    permission: 'recibos.index',
    title: "Recibos de Facturación",
    description: "Visualiza y gestiona los recibos de pago de los clientes.",
    buttonText: "Ir a Recibos de Facturación",
    route: "/facturacion/recibos",
    variant: "primary",
  },
];

const FacturacionHome = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loadingCard, setLoadingCard] = useState(null);

  const hasAccess = (permission) => user.permissions.includes(permission);

  const handleCardClick = (route, key, disabled) => {
    if (disabled) return;
    setLoadingCard(key);
    setTimeout(() => {
      navigate(route);
      setLoadingCard(null);
    }, 1200);
  };

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

      <Container className="mt-5">
        <Row className="justify-content-center">
          {facturacionModules.map((mod) => (
            <CommonCard
              key={mod.key}
              title={mod.title}
              description={mod.description}
              buttonText={mod.buttonText}
              route={mod.route}
              variant={mod.variant}          // <-- siempre "primary"
              disabled={!hasAccess(mod.permission)}
              isLoading={loadingCard === mod.key}
              onClick={() => handleCardClick(mod.route, mod.key, !hasAccess(mod.permission))}
              colSize={4}
              cardClassName="home-card"
            />
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default FacturacionHome;

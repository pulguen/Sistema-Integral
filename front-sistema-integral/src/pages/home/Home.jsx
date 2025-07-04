import React, { useContext, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CommonCard from '../../components/common/Cards/Cards';
import { AuthContext } from '../../context/AuthContext';

const systems = [
  {
    key: 'facturacion',
    title: 'Sistema de Facturación',
    description: 'Administra tus facturas y genera nuevas transacciones.',
    buttonText: 'Ir a Facturación',
    route: '/facturacion',
    variant: 'primary',
  },
  {
    key: 'inventario',
    title: 'Sistema de Inventario',
    description: 'Gestiona el stock y tus productos disponibles.',
    buttonText: 'Ir a Inventario',
    route: '/inventario',
    variant: 'success',
  },
  {
    key: 'recursos-humanos',
    title: 'Sistema de Recursos Humanos',
    description: 'Controla la información de tus empleados y nómina.',
    buttonText: 'Ir a RRHH',
    route: '/recursos-humanos',
    variant: 'warning',
  },
  {
    key: 'usuarios',
    title: 'Sistema de Usuarios',
    description: 'Controla la información de tus Usuarios, Roles y Permisos.',
    buttonText: 'Ir a Usuarios',
    route: '/usuarios',
    variant: 'info',
  },
  {
    key: 'caja',
    title: 'Sistema de Caja',
    description: 'Registra los movimientos de caja y administra todos los medios de pago disponibles.',
    buttonText: 'Ir a Caja',
    route: '/caja',
    variant: 'dark',
  },
];

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loadingCard, setLoadingCard] = useState(null);

  // Validar permisos según el sistema
  const hasAccess = (systemKey) =>
    user?.permissions?.includes(`${systemKey}.access`);

  // Lógica para el click de las cards
  const handleCardClick = (route, systemKey) => {
    if (!hasAccess(systemKey)) return;

    setLoadingCard(systemKey);

    setTimeout(() => {
      navigate(route);
      setLoadingCard(null);
    }, 1200); // feedback visual breve antes de navegar
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4 fw-bold">
        Bienvenido al Sistema Integral de la Municipalidad de Zapala
      </h2>
      <Row className="justify-content-center" xs={1} sm={2} md={3} lg={3}>
        {systems.map((system) => (
          <CommonCard
            key={system.key}
            title={system.title}
            description={system.description}
            buttonText={system.buttonText}
            route={system.route}
            variant={system.variant}
            disabled={!hasAccess(system.key)}
            isLoading={loadingCard === system.key}
            onClick={() => handleCardClick(system.route, system.key)}
            colSize={4}
            cardClassName="home-card"
          />
        ))}
      </Row>
    </Container>
  );
};

export default Home;

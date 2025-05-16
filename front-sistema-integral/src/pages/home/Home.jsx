import React, { useContext, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CommonCard from '../../components/common/Cards/Cards';
import { AuthContext } from '../../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loadingCard, setLoadingCard] = useState(null); // card en carga

  const hasAccess = (system) => user.permissions.includes(`${system}.access`);

  const handleCardClick = (route, systemKey) => {
    if (!hasAccess(systemKey)) return;

    setLoadingCard(systemKey);

    // Simulación de carga antes de redirigir
    setTimeout(() => {
      navigate(route);
      setLoadingCard(null);
    }, 1500);
  };

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
          disabled={!hasAccess('facturacion')}
          isLoading={loadingCard === 'facturacion'}
          onClick={() => handleCardClick('/facturacion', 'facturacion')}
        />

        <CommonCard
          title="Sistema de Inventario"
          description="Gestiona el stock y tus productos disponibles."
          buttonText="Ir a Inventario"
          route="/inventario"
          variant="success"
          disabled={!hasAccess('inventario')}
          isLoading={loadingCard === 'inventario'}
          onClick={() => handleCardClick('/inventario', 'inventario')}
        />

        <CommonCard
          title="Sistema de Recursos Humanos"
          description="Controla la información de tus empleados y nómina."
          buttonText="Ir a Recursos Humanos"
          route="/recursos-humanos"
          variant="warning"
          disabled={!hasAccess('recursos-humanos')}
          isLoading={loadingCard === 'recursos-humanos'}
          onClick={() => handleCardClick('/recursos-humanos', 'recursos-humanos')}
        />

        <CommonCard
          title="Sistema de Usuarios"
          description="Controla la información de tus Usuarios, Roles y Permisos."
          buttonText="Ir a Usuarios"
          route="/usuarios"
          variant="info"
          disabled={!hasAccess('usuarios')}
          isLoading={loadingCard === 'usuarios'}
          onClick={() => handleCardClick('/usuarios', 'usuarios')}
        />

        <CommonCard
          title="Sistema de Caja"
          description="Registra los movimientos de caja y administra todos los medios de pago disponibles."
          buttonText="Ir a Caja"
          route="/caja"
          variant="dark"
          disabled={!hasAccess('caja')}
          isLoading={loadingCard === 'caja'}
          onClick={() => handleCardClick('/caja', 'caja')}
        />
      </Row>
    </Container>
  );
};

export default Home;

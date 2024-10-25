// src/features/facturacion/components/BombeoAgua/BombeoAgua.jsx
import React, { useState, useEffect } from 'react';
import { Breadcrumb, Tabs, Tab } from 'react-bootstrap';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { BombeoAguaProvider } from '../../../../context/BombeoAguaContext';

const BombeoAgua = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener la pestaña activa desde la ruta
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[pathParts.length - 1] || 'home';

  const [key, setKey] = useState(activeTab);

  useEffect(() => {
    setKey(activeTab);
  }, [activeTab]);

  const handleSelect = (k) => {
    setKey(k);
    navigate(`/facturacion/bombeo-agua/${k}`);
  };

  // Mapear las claves de las pestañas a títulos para las migas de pan
  const tabTitles = {
    home: 'Home',
    periodos: 'Periodos',
    recibos: 'Recibos',
  };

  return (
    <BombeoAguaProvider>
      <div>
        <Breadcrumb>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/facturacion' }}>
            Facturación
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/facturacion/bombeo-agua' }}>
            Bombeo de Agua
          </Breadcrumb.Item>
          {key && key !== 'home' && (
            <Breadcrumb.Item active>{tabTitles[key]}</Breadcrumb.Item>
          )}
        </Breadcrumb>

        <h1>Facturación - Bombeo de Agua</h1>
        
        {/* Pestañas para Home, Periodos y Recibos */}
        <Tabs
          id="bombeo-agua-tabs"
          activeKey={key}
          onSelect={handleSelect}
          className="mb-3"
        >
          <Tab eventKey="home" title="Home" />
          <Tab eventKey="periodos" title="Periodos" />
          <Tab eventKey="recibos" title="Recibos" />
        </Tabs>

        {/* Aquí se renderizan las rutas anidadas utilizando Outlet */}
        <Outlet />
      </div>
    </BombeoAguaProvider>
  );
};

export default BombeoAgua;

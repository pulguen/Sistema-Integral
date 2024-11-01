import React, { useState, useEffect } from 'react';
import { Breadcrumb, Tabs, Tab } from 'react-bootstrap';
import { Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { BombeoAguaProvider } from '../../../../context/BombeoAguaContext';
import HomeBombeoAgua from './HomeBombeoAgua';
import PeriodosBombeo from './PeriodosBombeo';
import RecibosBombeo from './RecibosBombeo';

const BombeoAgua = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  const tabTitles = {
    home: 'Inicio',
    periodos: 'Periodos',
    recibos: 'Recibos',
  };

  return (
    <BombeoAguaProvider>
      <div>
        <Breadcrumb>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            Inicio
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

        <Tabs id="bombeo-agua-tabs" activeKey={key} onSelect={handleSelect} className="mb-3">
          <Tab eventKey="home" title="Inicio" />
          <Tab eventKey="periodos" title="Periodos" />
          <Tab eventKey="recibos" title="Recibos" />
        </Tabs>

        <Routes>
          <Route path="home" element={<HomeBombeoAgua />} />
          <Route path="periodos" element={<PeriodosBombeo />} />
          <Route path="recibos" element={<RecibosBombeo />} />
          <Route path="" element={<HomeBombeoAgua />} />
        </Routes>
      </div>
    </BombeoAguaProvider>
  );
};

export default BombeoAgua;

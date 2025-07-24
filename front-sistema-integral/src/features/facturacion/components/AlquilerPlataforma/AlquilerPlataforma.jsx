import React, { useState, useEffect } from 'react';
import { Breadcrumb, Tabs, Tab } from 'react-bootstrap';
import { Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { AlquilerPlataformaProvider } from '../../../../context/AlquilerPlataformaContext';
import AlquilerHome from './AlquilerHome';
import PeriodosAlquiler from './PeriodosAlquiler';
import RecibosAlquiler from './RecibosAlquiler';

const AlquilerPlataforma = () => {
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
    navigate(`/alquiler/${k}`);
  };

  const tabTitles = {
    home: 'Inicio',
    periodos: 'Periodos',
    recibos: 'Recibos',
  };

  return (
    <AlquilerPlataformaProvider>
      <div>
        <Breadcrumb>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            Inicio
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/alquiler' }}>
            Alquiler Plataforma
          </Breadcrumb.Item>
          {key && key !== 'home' && (
            <Breadcrumb.Item active>{tabTitles[key]}</Breadcrumb.Item>
          )}
        </Breadcrumb>

        <h1>Gestión de Alquiler de Terminal</h1>

        <Tabs id="alquiler-tabs" activeKey={key} onSelect={handleSelect} className="mb-3">
          <Tab eventKey="home" title="Inicio" />
          <Tab eventKey="periodos" title="Periodos" />
          <Tab eventKey="recibos" title="Recibos" />
        </Tabs>

        <Routes>
          <Route path="home" element={<AlquilerHome />} />
          <Route path="periodos" element={<PeriodosAlquiler />} />
          <Route path="recibos" element={<RecibosAlquiler />} />
          <Route path="" element={<AlquilerHome />} />
        </Routes>
      </div>
    </AlquilerPlataformaProvider>
  );
};

export default AlquilerPlataforma;

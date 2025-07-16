// routes/FacturacionRoutes.js
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { FacturacionProvider } from '../context/FacturacionContext';
import GlobalLayout from '../components/layout/GlobalLayout/GlobalLayout';
import MainLayout from '../components/layout/MainLayout/MainLayout';

// Importa tus componentes...
import HomeFacturacion from '../features/facturacion/components/HomeFacturacion/HomeFacturacion';
import Clientes from '../features/facturacion/components/Clientes/Clientes';
import ClienteDetalle from '../features/facturacion/components/Clientes/ClienteDetalle';
import PeriodosHistorial from '../features/facturacion/components/Periodos/PeriodosHistorial';
import RecibosHistorial from '../features/facturacion/components/Recibos/RecibosHistorial';
import BombeoAgua from '../features/facturacion/components/BombeoAgua/BombeoAgua';
import { BombeoAguaProvider } from '../context/BombeoAguaContext';

function FacturacionLayout() {
  return (
    <FacturacionProvider>
      <GlobalLayout>
        <MainLayout section="facturacion">
          <Outlet />
        </MainLayout>
      </GlobalLayout>
    </FacturacionProvider>
  );
}

export default function FacturacionRoutes() {
  return (
    <Routes>
      <Route element={<FacturacionLayout />}>
        <Route index element={<HomeFacturacion />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:id" element={<ClienteDetalle />} />
        <Route path="periodos" element={<PeriodosHistorial />} />
        <Route path="recibos" element={<RecibosHistorial />} />
        <Route
          path="bombeo-agua/*"
          element={
            <BombeoAguaProvider>
              <BombeoAgua />
            </BombeoAguaProvider>
          }
        />
      </Route>
    </Routes>
  );
}

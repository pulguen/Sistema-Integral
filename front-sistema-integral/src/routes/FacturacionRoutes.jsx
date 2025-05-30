import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { FacturacionProvider } from '../context/FacturacionContext';
import GlobalLayout from '../components/layout/GlobalLayout/GlobalLayout';
import MainLayout from '../components/layout/MainLayout/MainLayout';

import HomeFacturacion from '../features/facturacion/components/HomeFacturacion/HomeFacturacion';
import { ClientProvider } from '../context/ClientContext';
import Clientes from '../features/facturacion/components/Clientes/Clientes';
import ClienteDetalle from '../features/facturacion/components/Clientes/ClienteDetalle';
import { BombeoAguaProvider } from '../context/BombeoAguaContext';
import BombeoAgua from '../features/facturacion/components/BombeoAgua/BombeoAgua';
import PeriodosHistorial from '../features/facturacion/components/Periodos/PeriodosHistorial';
import RecibosHistorial from '../features/facturacion/components/Recibos/RecibosHistorial';

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

        <Route
          path="clientes"
          element={
            <ClientProvider>
              <Clientes />
            </ClientProvider>
          }
        />
        <Route
          path="clientes/:id"
          element={
            <ClientProvider>
              <ClienteDetalle />
            </ClientProvider>
          }
        />

        <Route
          path="bombeo-agua/*"
          element={
            <BombeoAguaProvider>
              <BombeoAgua />
            </BombeoAguaProvider>
          }
        />
        
        <Route
          path="periodos"
          element={
            <ClientProvider>
              <PeriodosHistorial />
            </ClientProvider>
          }
        />

        <Route
          path="recibos"
          element={
            <ClientProvider>
              <RecibosHistorial />
            </ClientProvider>
          }
        />

      </Route>
    </Routes>
  );
}

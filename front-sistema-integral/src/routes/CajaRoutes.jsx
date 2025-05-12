import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Layouts
import GlobalLayout from '../components/layout/GlobalLayout/GlobalLayout';
import MainLayout from '../components/layout/MainLayout/MainLayout';

// Contexto de caja
import { CajaProvider } from '../context/CajaContext';

// Vistas de caja
import CajaHome from '../features/caja/components/CajaHome';
import HistorialCaja from '../features/caja/components/HistorialCaja';
import ArqueoCaja from '../features/caja/components/ArqueoCaja';

function CajaLayout() {
  return (
    <GlobalLayout>
      <MainLayout section="caja">
        <CajaProvider>
          <Outlet />
        </CajaProvider>
      </MainLayout>
    </GlobalLayout>
  );
}

export default function CajaRoutes() {
  return (
    <Routes>
      <Route element={<CajaLayout />}>
        <Route index element={<CajaHome />} />
        <Route path="historial" element={<HistorialCaja />} />
        <Route path="arqueo" element={<ArqueoCaja />} />
      </Route>
    </Routes>
  );
}

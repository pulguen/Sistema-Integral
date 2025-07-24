//alquilerPlataformaRoutes.jsx
import { Routes, Route, Outlet } from 'react-router-dom';

// Layouts
import GlobalLayout from '../components/layout/GlobalLayout/GlobalLayout';
import MainLayout from '../components/layout/MainLayout/MainLayout';

// Contexto de Alquiler
import { AlquilerPlataformaProvider } from '../context/AlquilerPlataformaContext';

// Vista principal de Alquiler
import AlquilerPlataforma from '../features/facturacion/components/AlquilerPlataforma/AlquilerPlataforma';

function AlquilerLayout() {
  return (
    <AlquilerPlataformaProvider>
      <GlobalLayout>
        <MainLayout section="Alquiler Plataforma">
          <Outlet />
        </MainLayout>
      </GlobalLayout>
    </AlquilerPlataformaProvider>
  );
}

export default function AlquilerPlataformaRoutes() {
  return (
    <Routes>
      <Route element={<AlquilerLayout />}>
        <Route index element={<AlquilerPlataforma />} />
      </Route>
    </Routes>
  );
}
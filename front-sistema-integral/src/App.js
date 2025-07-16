// src/App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AsideLinksProvider } from './context/AsideLinksContext';
import PrivateRoute from './privateRoute/PrivateRoute';

import Login        from './features/auth/Login';
import Home         from './pages/home/Home';
import Inventario   from './features/Inventario/components/Inventario';
import About        from './components/layout/Footer/About';
import Unauthorized from './pages/Unauthorized/Unauthorized';

import GlobalLayout from './components/layout/GlobalLayout/GlobalLayout';
import MainLayout   from './components/layout/MainLayout/MainLayout';

import FacturacionRoutes from './routes/FacturacionRoutes';
import UsuariosRoutes    from './routes/UsuariosRoutes';
import CajaRoutes        from './routes/CajaRoutes';

import { ClientProvider } from './context/ClientContext'; // ⬅️ Importante

export default function App() {
  return (
    <AsideLinksProvider>
      <ClientProvider> {/* ⬅️ Ahora envuelve toda la app */}
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Protegidas */}
          <Route element={<PrivateRoute />}>
            {/* Home envuelto en GlobalLayout para mostrar navbar */}
            <Route 
              path="/" 
              element={
                <GlobalLayout>
                  <Home />
                </GlobalLayout>
              } 
            />

            {/* Facturación (ya lleva GlobalLayout dentro de FacturacionRoutes) */}
            <Route path="/facturacion/*" element={<FacturacionRoutes />} />

            {/* Inventario envuelto en GlobalLayout + MainLayout */}
            <Route
              path="/inventario"
              element={
                <GlobalLayout>
                  <MainLayout section="inventario">
                    <Inventario />
                  </MainLayout>
                </GlobalLayout>
              }
            />

            {/* Usuarios (usa su propio GlobalLayout dentro de UsuariosRoutes) */}
            <Route path="/usuarios/*" element={<UsuariosRoutes />} />

            {/* Caja (usa su propio GlobalLayout dentro de CajaRoutes) */}
            <Route path="/caja/*" element={<CajaRoutes />} />
          </Route>

          {/* Otras públicas, también con GlobalLayout */}
          <Route
            path="/unauthorized"
            element={
              <GlobalLayout>
                <Unauthorized />
              </GlobalLayout>
            }
          />
          <Route
            path="/about"
            element={
              <GlobalLayout>
                <About />
              </GlobalLayout>
            }
          />

          {/* Catch-all redirige a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ClientProvider>
    </AsideLinksProvider>
  );
}

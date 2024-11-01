// src/App.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AsideLinksProvider } from './context/AsideLinksContext';
import PrivateRoute from './privateRoute/PrivateRoute.js';
import Login from './features/auth/Login.jsx';
import Home from './pages/home/Home.jsx';
import Facturacion from './features/facturacion/components/Facturacion.jsx';
import Inventario from './features/Inventario/components/Inventario.jsx';
import GlobalLayout from './components/layout/GlobalLayout/GlobalLayout.jsx';
import MainLayout from './components/layout/MainLayout/MainLayput.jsx';
import Clientes from './features/facturacion/components/Clientes/Clientes.jsx';
import ClienteDetalle from './features/facturacion/components/Clientes/ClienteDetalle.jsx';
import BombeoAgua from './features/facturacion/components/BombeoAgua/BombeoAgua.jsx';
import About from './components/layout/Footer/About.jsx';

function AppContent() {
  return (
    <div className="App">
      <Routes>
        {/* Ruta pública para el login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          {/* Ruta Home */}
          <Route
            path="/"
            element={
              <GlobalLayout>
                <Home />
              </GlobalLayout>
            }
          />

          {/* Ruta Facturación */}
          <Route
            path="/facturacion"
            element={
              <GlobalLayout>
                <MainLayout section="facturacion">
                  <Facturacion />
                </MainLayout>
              </GlobalLayout>
            }
          />

          {/* Rutas Clientes */}
          <Route
            path="/facturacion/clientes"
            element={
              <GlobalLayout>
                <MainLayout section="facturacion">
                  <Clientes />
                </MainLayout>
              </GlobalLayout>
            }
          />
          <Route
            path="/facturacion/clientes/:id"
            element={
              <GlobalLayout>
                <MainLayout section="facturacion">
                  <ClienteDetalle />
                </MainLayout>
              </GlobalLayout>
            }
          />

          {/* Ruta de Bombeo de Agua */}
          <Route
            path="/facturacion/bombeo-agua/*"
            element={
              <GlobalLayout>
                <MainLayout section="facturacion">
                  <BombeoAgua />
                </MainLayout>
              </GlobalLayout>
            }
          />

          {/* Ruta de Inventario */}
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
        </Route>

        {/* Ruta About */}
        <Route
          path="/about"
          element={
            <GlobalLayout>
              <About />
            </GlobalLayout>
          }
        />

        {/* Redirigir a login si no está autenticado */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AsideLinksProvider>
      <AppContent />
    </AsideLinksProvider>
  );
}

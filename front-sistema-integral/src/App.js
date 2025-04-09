import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AsideLinksProvider } from './context/AsideLinksContext';
import PrivateRoute from './privateRoute/PrivateRoute.js';
import Login from './features/auth/Login.jsx';
import Home from './pages/home/Home.jsx';
import Facturacion from './features/facturacion/components/HomeFacturacion/HomeFacturacion.jsx';
import Inventario from './features/Inventario/components/Inventario.jsx';
import GlobalLayout from './components/layout/GlobalLayout/GlobalLayout.jsx';
import MainLayout from './components/layout/MainLayout/MainLayput.jsx';
import Clientes from './features/facturacion/components/Clientes/Clientes.jsx';
import ClienteDetalle from './features/facturacion/components/Clientes/ClienteDetalle.jsx';
import BombeoAgua from './features/facturacion/components/BombeoAgua/BombeoAgua.jsx';
import About from './components/layout/Footer/About.jsx';
import Usuarios from './features/Users/Components/Usuarios.jsx';
import PeriodosHistorial from './features/facturacion/components/Periodos/PeriodosHistorial.jsx';
import Roles from './features/Users/Components/Roles.jsx';
import Permisos from './features/Users/Components/Permisos.jsx';
import RecibosHistorial from './features/facturacion/components/Recibos/RecibosHistorial.jsx';
import CajaHome from './features/caja/components/CajaHome.jsx';
import HistorialCaja from './features/caja/components/HistorialCaja.jsx';
import ArqueoCaja from './features/caja/components/ArqueoCaja.jsx';
import Unauthorized from './pages/Unauthorized/Unauthorized.jsx';
import UsuarioDetalle from './features/Users/Components/UsuarioDetalle.jsx';

// Providers
import { FacturacionProvider } from './context/FacturacionContext';
import { BombeoAguaProvider } from './context/BombeoAguaContext';
import { UsersProvider } from './context/UsersContext.jsx';
import { CajaProvider } from './context/CajaContext';

//
// Componente para las rutas de Facturación
//
function FacturacionRoutes() {
  return (
    <FacturacionProvider>
      <GlobalLayout>
        <MainLayout section="facturacion">
          <Routes>
            <Route index element={<Facturacion />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="clientes/:id" element={<ClienteDetalle />} />
            <Route
              path="bombeo-agua/*"
              element={
                <BombeoAguaProvider>
                  <BombeoAgua />
                </BombeoAguaProvider>
              }
            />
            <Route path="periodos" element={<PeriodosHistorial />} />
            <Route path="recibos" element={<RecibosHistorial />} />
          </Routes>
        </MainLayout>
      </GlobalLayout>
    </FacturacionProvider>
  );
}

//
// Componente para las rutas de Usuarios
//
function UsuariosRoutes() {
  return (
    <UsersProvider>
      <GlobalLayout>
        <MainLayout section="usuarios">
          <Routes>
            <Route index element={<Usuarios />} />
            <Route path="roles" element={<Roles />} />
            <Route path="permisos" element={<Permisos />} />
            <Route path=":id" element={<UsuarioDetalle />} />
          </Routes>
        </MainLayout>
      </GlobalLayout>
    </UsersProvider>
  );
}

//
// Componente para las rutas de Caja
//
function CajaRoutes() {
  return (
    <GlobalLayout>
      <MainLayout section="caja">
        <CajaProvider>
          <Routes>
            <Route index element={<CajaHome />} />
            <Route path="historial" element={<HistorialCaja />} />
            <Route path="arqueo" element={<ArqueoCaja />} />
          </Routes>
        </CajaProvider>
      </MainLayout>
    </GlobalLayout>
  );
}

//
// Componente principal de la aplicación (AppContent)
//
function AppContent() {
  return (
    <div className="App">
      <Routes>
        {/* Ruta pública para el login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<GlobalLayout><Home /></GlobalLayout>} />
          <Route path="/facturacion/*" element={<FacturacionRoutes />} />
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
          <Route path="/usuarios/*" element={<UsuariosRoutes />} />
          <Route path="/caja/*" element={<CajaRoutes />} />
        </Route>

        {/* Rutas públicas adicionales */}
        <Route path="/unauthorized" element={<GlobalLayout><Unauthorized /></GlobalLayout>} />
        <Route path="/about" element={<GlobalLayout><About /></GlobalLayout>} />

        {/* Redirigir a login para cualquier ruta no reconocida */}
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

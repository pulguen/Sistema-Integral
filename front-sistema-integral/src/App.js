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
import HomeCaja from './features/caja/HomeCaja.jsx';

// Importamos los Proveedores
import { FacturacionProvider } from './context/FacturacionContext';
import { BombeoAguaProvider } from './context/BombeoAguaContext';
import { UsersProvider } from './context/UsersContext.jsx';

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

          {/* Ruta Facturación con subrutas */}
          <Route
            path="/facturacion/*"
            element={
              <FacturacionProvider>
                <GlobalLayout>
                  <MainLayout section="facturacion">
                    <Routes>
                      <Route index element={<Facturacion />} />
                      {/* Rutas Clientes */}
                      <Route path="clientes" element={<Clientes />} />
                      <Route path="clientes/:id" element={<ClienteDetalle />} />
                      
                      {/* Ruta de Bombeo de Agua */}
                      <Route
                        path="bombeo-agua/*"
                        element={
                          <BombeoAguaProvider>
                            <BombeoAgua />
                          </BombeoAguaProvider>
                        }
                      />
                      
                      {/* Ruta de Periodos */}
                      <Route path="periodos" element={<PeriodosHistorial />} />
                      
                      {/* Ruta de Recibos */}
                      <Route path="recibos" element={<RecibosHistorial />} />
                      {/* Puedes agregar más subrutas aquí */}
                    </Routes>
                  </MainLayout>
                </GlobalLayout>
              </FacturacionProvider>
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

          {/* Rutas Usuarios */}
          <Route
            path="/usuarios/*"
            element={
              <UsersProvider>
                <GlobalLayout>
                  <MainLayout section="usuarios">
                    <Routes>
                      <Route index element={<Usuarios />} />
                      <Route path="roles" element={<Roles />} />
                      <Route path="permisos" element={<Permisos />} />
                      {/* Puedes agregar más subrutas aquí */}
                    </Routes>
                  </MainLayout>
                </GlobalLayout>
              </UsersProvider>
            }
          />

          {/* Ruta Caja */}
          <Route
            path="/caja"
            element={
              <GlobalLayout>
                <MainLayout section="caja">
                  <HomeCaja />
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

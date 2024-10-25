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
import HomeBombeoAgua from './features/facturacion/components/BombeoAgua/HomeBombeoAgua.jsx';
import BombeoAguaForm from './features/facturacion/components/BombeoAgua/BombeoAguaForm.jsx';
import PeriodosBombeoList from './features/facturacion/components/BombeoAgua/PeriodosBombeoList.jsx';
import RecibosBombeo from './features/facturacion/components/BombeoAgua/RecibosBombeo.jsx';
import { BombeoAguaProvider } from './context/BombeoAguaContext'; // Importa el contexto
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
            path="/facturacion/bombeo-agua"
            element={
              <GlobalLayout>
                <MainLayout section="facturacion">
                  {/* Envolvemos las rutas de bombeo de agua dentro del proveedor */}
                  <BombeoAguaProvider>
                    <BombeoAgua />
                  </BombeoAguaProvider>
                </MainLayout>
              </GlobalLayout>
            }
          >
            {/* Rutas Anidadas para Bombeo de Agua */}
            <Route index element={<HomeBombeoAgua />} />
            <Route path="home" element={<HomeBombeoAgua />} />
            <Route
              path="periodos"
              element={
                <>
                  <BombeoAguaForm />
                  <PeriodosBombeoList />
                </>
              }
            />
            <Route
              path="recibos"
              element={<RecibosBombeo />} // Usa el componente RecibosBombeo aquí
            />
          </Route>

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

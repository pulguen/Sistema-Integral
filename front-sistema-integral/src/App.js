// src/App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/styles/App.css';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './privateRoute/PrivateRoute.js';
import Login from './features/auth/Login.jsx';
import Home from './pages/home/Home.jsx';
import Facturacion from './features/facturacion/components/Facturacion.jsx';
import Inventario from './features/Inventario/components/Inventario.jsx';
import GlobalLayout from './components/layout/GlobalLayout/GlobalLayout.jsx';
import MainLayout from './components/layout/MainLayout/MainLayput.jsx';
import Clientes from './features/facturacion/components/Clientes.jsx';

function AppContent() {
  return (
    <div className="App">
      <Routes>
        {/* Ruta pública para el login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas con el layout global */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <GlobalLayout>
                <Home />
              </GlobalLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/facturacion"
          element={
            <PrivateRoute>
              <GlobalLayout>
                <MainLayout
                  asideLinks={[
                    { href: '/facturacion', label: 'Home' },
                    { href: '/facturacion/agua', label: 'Consumo Agua' },
                    { href: '/facturacion/hornopirolitico', label: 'Horno Pirolítico' },
                    { href: '/facturacion/Terminal', label: 'Alquiler Terminal' },
                    { href: '/facturacion/crear', label: 'Crear Factura' },
                    { href: '/facturacion/historial', label: 'Historial Facturas' },                    
                    { href: '/facturacion/comprobantes', label: 'Comprobantes' },
                    { href: '/facturacion/clientes', label: 'Clientes' },
                  ]}>
                  <Facturacion />
                </MainLayout>
              </GlobalLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/facturacion/clientes"
          element={
            <PrivateRoute>
              <GlobalLayout>
                <MainLayout
                  asideLinks={[
                    { href: '/facturacion', label: 'Home' },
                    { href: '/facturacion/agua', label: 'Consumo Agua' },
                    { href: '/facturacion/hornopirolitico', label: 'Horno Pirolítico' },
                    { href: '/facturacion/Terminal', label: 'Alquiler Terminal' },
                    { href: '/facturacion/crear', label: 'Crear Factura' },
                    { href: '/facturacion/historial', label: 'Historial Facturas' },
                    { href: '/facturacion/comprobantes', label: 'Comprobantes' },
                    { href: '/facturacion/clientes', label: 'Clientes' },
                  ]}
                >
                  <Clientes />
                </MainLayout>
              </GlobalLayout>
            </PrivateRoute>
          }
        />


        <Route
          path="/inventario"
          element={
            <PrivateRoute>
              <GlobalLayout>
                <MainLayout
                  asideLinks={[
                    { href: '/inventario/agregar', label: 'Agregar Producto' },
                    { href: '/inventario/stock', label: 'Ver Stock' },
                  ]}
                >
                  <Inventario />
                </MainLayout>
              </GlobalLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
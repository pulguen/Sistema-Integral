// app.js
import React, {useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import PrivateRoute from './privateRoute/PrivateRoute.js';
import Login from './features/auth/Login.jsx';
import Home from './pages/home/Home.jsx';
import NavBar from './components/layout/Navbar/Navbar.jsx';

function AppContent() {
  // Obtén el contexto de autenticación
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="App">
        {/* Muestra el NavBar solo si el usuario está autenticado */}
        {isAuthenticated && ( <NavBar /> )}
        <Routes>
          {/* Ruta pública para el login */}
          <Route exact path='/login' element={<Login />} />

          {/* Rutas protegidas */}
          <Route exact path='/' element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
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

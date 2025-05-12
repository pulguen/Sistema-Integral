import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Layouts
import GlobalLayout from '../components/layout/GlobalLayout/GlobalLayout';
import MainLayout from '../components/layout/MainLayout/MainLayout';

// Contexto de usuarios
import { UsersProvider } from '../context/UsersContext';

// Vistas de usuarios
import Usuarios from '../features/Users/Components/Usuarios';
import Roles from '../features/Users/Components/Roles';
import Permisos from '../features/Users/Components/Permisos';
import UsuarioDetalle from '../features/Users/Components/UsuarioDetalle';

function UsuariosLayout() {
  return (
    <UsersProvider>
      <GlobalLayout>
        <MainLayout section="usuarios">
          <Outlet />
        </MainLayout>
      </GlobalLayout>
    </UsersProvider>
  );
}

export default function UsuariosRoutes() {
  return (
    <Routes>
      <Route element={<UsuariosLayout />}>
        <Route index element={<Usuarios />} />
        <Route path="roles" element={<Roles />} />
        <Route path="permisos" element={<Permisos />} />
        <Route path=":id" element={<UsuarioDetalle />} />
      </Route>
    </Routes>
  );
}

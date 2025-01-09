// src/features/Users/Components/Permisos.jsx
import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import PermisosList from './PermisosList.jsx';

export default function Permisos() {
  return (
    <div className="permisos-section">
      {/* Migas de Pan */}
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/usuarios">Usuarios</Breadcrumb.Item>
        <Breadcrumb.Item active>Permisos</Breadcrumb.Item>
      </Breadcrumb>

      {/* Título de la Sección */}
      <h3 className="section-title">Gestión de Permisos</h3>

      {/* Aquí podemos agregar el componente para listar permisos */}
      <PermisosList />
    </div>
  );
}
